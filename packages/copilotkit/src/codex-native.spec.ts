import assert from "node:assert/strict";
import { ChildProcess } from "node:child_process";
import { once } from "node:events";
import { mkdtempSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { Subject, lastValueFrom, toArray } from "rxjs";
import { EventType, type Message } from "@ag-ui/core";
import { CodexAgentAdapter } from "./codex-agent.ts";
import { CODEX_CONFIG, codexProcessOptions } from "./codex-config.ts";
import { spawnCodexConnection, type CodexMessage } from "./codex-rpc.ts";

function nativeOptions() {
  const previous = process.env.COPILOTKIT_CODEX_HOME;
  // No real credentials or configured servers. Leave this private directory
  // for OS cleanup because transport.close() terminates asynchronously.
  process.env.COPILOTKIT_CODEX_HOME = mkdtempSync(
    join(tmpdir(), "elmethis-codex-protocol-"),
  );
  try {
    const options = codexProcessOptions();
    return {
      ...options,
      args: [
        ...options.args,
        "app-server",
        "--strict-config",
        ...CODEX_CONFIG.flatMap((value) => ["-c", value]),
        "-c",
        "mcp_servers.aws-knowledge.enabled=false",
      ],
    };
  } finally {
    if (previous === undefined) {
      delete process.env.COPILOTKIT_CODEX_HOME;
    } else {
      process.env.COPILOTKIT_CODEX_HOME = previous;
    }
  }
}

const image =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR4nGP4z8DwHwAFAAH/iZk9HQAAAABJRU5ErkJggg==";
const imageMessage: Message = {
  id: "image",
  role: "user",
  content: [
    { type: "text", text: "Describe the image." },
    {
      type: "image",
      source: { type: "url", value: "https://images.example/test.png" },
    },
  ],
};
const cases: { name: string; messages: Message[] }[] = [
  {
    name: "frontend-tool history",
    messages: [
      { id: "user", role: "user", content: "Weather?" },
      {
        id: "assistant",
        role: "assistant",
        toolCalls: [
          {
            id: "call",
            type: "function",
            function: { name: "weather", arguments: "{}" },
          },
        ],
      },
      { id: "tool", role: "tool", toolCallId: "call", content: "Sunny" },
    ],
  },
  { name: "remote image input", messages: [imageMessage] },
  {
    name: "remote image history",
    messages: [
      imageMessage,
      { id: "next", role: "user", content: "What color is it?" },
    ],
  },
];
for (const fixture of cases) {
  void test(
    `pinned Codex accepts adapter payloads: ${fixture.name}`,
    { timeout: 30_000 },
    async () => {
      const native = spawnCodexConnection(nativeOptions());
      const events = new Subject<CodexMessage>();
      const subscription = native.events.subscribe({
        error: (error: unknown) => events.error(error),
      });
      const methods: string[] = [];
      const agent = new CodexAgentAdapter({
        model: "fixture-model",
        imageResolver: () => Promise.resolve(image),
        connectionFactory: () => ({
          events,
          notify: (method, params) => native.notify(method, params),
          respond: (id, result) => native.respond(id, result),
          async request(method, params) {
            methods.push(method);
            // Authentication, downloading, and inference completion are simulated;
            // the pinned executable parses every real protocol request.
            if (method === "account/read") {
              return { account: { type: "chatgpt" } };
            }
            if (method === "thread/inject_items") {
              assert.doesNotMatch(JSON.stringify(params), /images\.example/);
            }
            const result = await native.request(method, params);
            if (method === "thread/start") {
              assert.ok(result && typeof result === "object");
              assert.deepEqual(Reflect.get(result, "activePermissionProfile"), {
                id: "elmethis-chat",
                extends: null,
              });
            }
            if (method === "turn/start") {
              events.next({
                method: "turn/completed",
                params: { turn: { status: "completed" } },
              });
            }
            return result;
          },
          close() {
            subscription.unsubscribe();
            native.close();
          },
        }),
      });
      try {
        const result = await lastValueFrom(
          agent
            .run({
              threadId: "test",
              runId: "test-run",
              context: [],
              state: {},
              forwardedProps: {},
              tools: [
                {
                  name: "weather",
                  description: "Weather",
                  parameters: { type: "object", properties: {} },
                },
              ],
              messages: fixture.messages,
            })
            .pipe(toArray()),
        );
        assert.deepEqual(
          result.map((event) => event.type),
          [
            EventType.RUN_STARTED,
            EventType.STATE_SNAPSHOT,
            EventType.RUN_FINISHED,
          ],
          JSON.stringify(result),
        );
        assert.ok(methods.includes("turn/start"));
        if (fixture.messages.length > 1) {
          assert.ok(methods.includes("thread/inject_items"));
        }
      } finally {
        subscription.unsubscribe();
        native.close();
      }
    },
  );
}

void test(
  "forced cleanup terminates an unresponsive native Codex process",
  { skip: process.platform === "win32", timeout: 10_000 },
  async (t) => {
    const options = nativeOptions();
    // eslint-disable-next-line @typescript-eslint/unbound-method -- Saved before mocking, then called with the original child as `this`.
    const kill = ChildProcess.prototype.kill;
    let pid: number | undefined;
    let exited: Promise<unknown[]> | undefined;
    t.mock.method(
      ChildProcess.prototype,
      "kill",
      function (this: ChildProcess, signal?: NodeJS.Signals | number) {
        if (
          signal === "SIGTERM" &&
          this.spawnfile === options.command &&
          this.pid
        ) {
          pid = this.pid;
          exited = once(this, "exit");
          // A stopped process cannot service SIGTERM; the transport must escalate.
          process.kill(pid, "SIGSTOP");
        }
        return kill.call(this, signal);
      },
    );
    const connection = spawnCodexConnection(options);
    connection.events.subscribe({ error: () => {} });
    try {
      await connection.request("initialize", {
        clientInfo: { name: "cleanup_test", version: "1" },
      });
      connection.close();
      assert.ok(exited);
      assert.deepEqual(await exited, [null, "SIGKILL"]);
      assert.ok(pid);
      const stoppedPid = pid;
      assert.throws(() => process.kill(stoppedPid, 0), { code: "ESRCH" });
    } finally {
      connection.close();
      if (pid) {
        try {
          process.kill(pid, "SIGKILL");
        } catch {
          /* Already reaped. */
        }
      }
    }
  },
);
