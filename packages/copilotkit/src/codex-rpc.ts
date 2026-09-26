import { spawn } from "node:child_process";
import { createInterface } from "node:readline";
import { Subject, type Observable } from "rxjs";

export type RpcId = string | number;

export interface CodexMessage {
  method: string;
  params?: unknown;
  id?: RpcId;
}

export interface CodexConnection {
  events: Observable<CodexMessage>;
  request(method: string, params: unknown): Promise<unknown>;
  notify(method: string, params: unknown): void;
  respond(id: RpcId, result: unknown): void;
  close(): void;
}

interface PendingRequest {
  resolve(value: unknown): void;
  reject(error: Error): void;
  timer: ReturnType<typeof setTimeout>;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isId(value: unknown): value is RpcId {
  return (
    typeof value === "string" ||
    (typeof value === "number" && Number.isFinite(value))
  );
}

function errorCode(error: unknown): string {
  return isRecord(error) && typeof error.code === "string"
    ? ` (${error.code})`
    : "";
}

export function spawnCodexConnection(options: {
  command: string;
  args: string[];
  cwd: string;
  env: NodeJS.ProcessEnv;
}): CodexConnection {
  const child = spawn(options.command, options.args, {
    cwd: options.cwd,
    env: options.env,
    // Stderr can contain credentials or prompts; never capture or inherit it.
    stdio: ["pipe", "pipe", "ignore"],
  });
  const lines = createInterface({ input: child.stdout, crlfDelay: Infinity });
  const events = new Subject<CodexMessage>();
  const pending = new Map<RpcId, PendingRequest>();
  let nextId = 1;
  let closedReason: Error | undefined;
  let killTimer: ReturnType<typeof setTimeout> | undefined;

  function shutdown(error?: Error): void {
    if (closedReason) {
      return;
    }
    closedReason = error ?? new Error("Codex app-server connection is closed.");
    lines.close();
    child.stdin.destroy();
    child.stdout.destroy();
    if (
      child.pid !== undefined &&
      child.exitCode === null &&
      child.signalCode === null
    ) {
      child.kill("SIGTERM");
      killTimer = setTimeout(() => {
        if (child.exitCode === null && child.signalCode === null) {
          child.kill("SIGKILL");
        }
      }, 1000);
      killTimer.unref();
    }
    for (const request of pending.values()) {
      clearTimeout(request.timer);
      request.reject(closedReason);
    }
    pending.clear();
    if (error) {
      events.error(error);
    } else {
      events.complete();
    }
  }

  // Keep pipe error listeners installed through teardown: an in-flight write
  // can emit EPIPE even after close() destroys stdin.
  child.stdin.on("error", (error: Error) => {
    shutdown(
      new Error(
        `Codex app-server stdin failed${errorCode(error)}; restart the connection.`,
      ),
    );
  });
  const failStdout = (error: Error) => {
    shutdown(
      new Error(
        `Codex app-server stdout failed${errorCode(error)}; restart the connection.`,
      ),
    );
  };
  lines.on("error", failStdout);
  child.stdout.on("error", failStdout);
  child.on("error", (error: Error) => {
    shutdown(
      new Error(
        `Could not start or run Codex app-server${errorCode(error)}; check command and cwd.`,
      ),
    );
  });
  child.once("exit", () => clearTimeout(killTimer));
  // Unlike exit, close follows delivery of the final stdout data.
  child.once("close", (code, signal) => {
    clearTimeout(killTimer);
    shutdown(
      new Error(
        `Codex app-server exited unexpectedly (${signal ?? `code ${String(code)}`}); restart the connection.`,
      ),
    );
  });

  lines.on("line", (line: string) => {
    if (closedReason) {
      return;
    }
    let message: unknown;
    try {
      message = JSON.parse(line);
    } catch {
      // Do not include raw output or JSON.parse's error: both can reveal prompts.
      shutdown(
        new Error(
          "Codex app-server emitted invalid JSON; expected JSONL on stdout.",
        ),
      );
      return;
    }
    const invalid = () =>
      shutdown(new Error("Codex app-server emitted an invalid RPC message."));
    if (!isRecord(message) || ("id" in message && !isId(message.id))) {
      invalid();
      return;
    }
    if ("method" in message) {
      if (typeof message.method !== "string") {
        invalid();
        return;
      }
      events.next({
        method: message.method,
        ...("params" in message ? { params: message.params } : {}),
        ...(isId(message.id) ? { id: message.id } : {}),
      });
      return;
    }
    if (!isId(message.id) || "result" in message === "error" in message) {
      invalid();
      return;
    }
    let responseError: Error | undefined;
    if ("error" in message) {
      if (
        !isRecord(message.error) ||
        typeof message.error.code !== "number" ||
        typeof message.error.message !== "string"
      ) {
        invalid();
        return;
      }
      responseError = new Error(
        `Codex app-server RPC error ${message.error.code}: ${message.error.message}`,
      );
    }
    const request = pending.get(message.id);
    if (!request) {
      // A timed-out request may still receive a response later.
      return;
    }
    pending.delete(message.id);
    clearTimeout(request.timer);
    if (responseError) {
      request.reject(responseError);
    } else {
      request.resolve(message.result);
    }
  });

  function send(message: CodexMessage | { id: RpcId; result: unknown }): void {
    if (closedReason) {
      throw closedReason;
    }
    let serialized: string;
    let malformedUnicode = false;
    try {
      serialized = JSON.stringify(message, (key, value: unknown) => {
        if (
          !key.isWellFormed() ||
          (typeof value === "string" && !value.isWellFormed())
        ) {
          malformedUnicode = true;
          throw new Error("Malformed Unicode");
        }
        return value;
      });
    } catch {
      throw new Error(
        malformedUnicode
          ? "Codex app-server params must contain well-formed Unicode."
          : "Codex app-server params must be JSON serializable.",
      );
    }
    try {
      child.stdin.write(`${serialized}\n`, (error) => {
        if (error) {
          shutdown(
            new Error(
              `Codex app-server stdin write failed${errorCode(error)}; restart the connection.`,
            ),
          );
        }
      });
    } catch (error) {
      shutdown(
        new Error(
          `Codex app-server stdin write failed${errorCode(error)}; restart the connection.`,
        ),
      );
    }
  }

  return {
    events: events.asObservable(),
    request(method, params) {
      if (closedReason) {
        return Promise.reject(closedReason);
      }
      const id = nextId++;
      return new Promise<unknown>((resolve, reject) => {
        const timer = setTimeout(() => {
          pending.delete(id);
          reject(
            new Error(
              "Codex app-server request timed out after 30000 ms; check server health.",
            ),
          );
        }, 30_000);
        pending.set(id, { resolve, reject, timer });
        try {
          send({ method, params, id });
        } catch (error) {
          pending.delete(id);
          clearTimeout(timer);
          reject(
            error instanceof Error
              ? error
              : new Error("Codex app-server request failed."),
          );
        }
      });
    },
    notify(method, params) {
      send({ method, params });
    },
    respond(id, result) {
      send({ id, result });
    },
    close() {
      shutdown();
    },
  };
}
