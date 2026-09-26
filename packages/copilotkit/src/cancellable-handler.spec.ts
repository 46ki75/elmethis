import assert from "node:assert/strict";
import { randomUUID } from "node:crypto";
import { getEventListeners, once } from "node:events";
import { setImmediate } from "node:timers/promises";
import { test, type TestContext } from "node:test";
import { AbstractAgent } from "@ag-ui/client";
import { EventType, type BaseEvent, type RunAgentInput } from "@ag-ui/core";
import {
  CopilotRuntime,
  InMemoryAgentRunner,
  type AgentRunnerRunRequest,
  type AgentRunnerStopRequest,
} from "@copilotkit/runtime/v2";
import { Observable } from "rxjs";
import { serve } from "@hono/node-server";
import { createCancellableCopilotHonoHandler } from "./cancellable-handler.ts";

type Options = Parameters<typeof createCancellableCopilotHonoHandler>[0];

class FakeConnection {
  closed = 0;
  aborted = 0;
  started = Promise.withResolvers<void>();
  disconnected = Promise.withResolvers<void>();
  finish = () => {};
}

// Like a native-connection adapter, abortRun is effective only after subscription.
// Clones share the test controls, not the per-run cancellation callback.
class FakeAgent extends AbstractAgent {
  connections = new Map<string, FakeConnection>();
  cancel?: () => void;

  override clone(): FakeAgent {
    const clone = super.clone() as FakeAgent;
    clone.connections = this.connections;
    clone.cancel = undefined;
    return clone;
  }

  override abortRun(): void {
    this.cancel?.();
  }

  run(input: RunAgentInput): Observable<BaseEvent> {
    return new Observable((subscriber) => {
      const connection = this.connections.get(input.runId);
      assert.ok(connection);
      subscriber.next({
        type: EventType.RUN_STARTED,
        threadId: input.threadId,
        runId: input.runId,
      });
      connection.finish = () => {
        subscriber.next({
          type: EventType.RUN_FINISHED,
          threadId: input.threadId,
          runId: input.runId,
        });
        subscriber.complete();
      };
      this.cancel = () => {
        connection.aborted++;
        connection.finish();
      };
      connection.started.resolve();
      return () => {
        connection.closed++;
        connection.disconnected.resolve();
        this.cancel = undefined;
      };
    });
  }
}

function fixture(
  t: TestContext,
  options: Partial<Omit<Options, "runtime">> = {},
  drainAfterRequest = false,
) {
  const agent = new FakeAgent({ agentId: "default" });
  const runner = new InMemoryAgentRunner({ onConcurrentRun: "supersede" });
  const stop = t.mock.method(runner, "stop");
  const runtime = new CopilotRuntime({
    agents: { default: agent },
    runner,
    ɵtelemetry: { capture: () => Promise.resolve() },
    afterRequestMiddleware: drainAfterRequest
      ? () => Promise.resolve()
      : undefined,
  });
  const basePath = options.basePath ?? "/copilotkit/codex";
  const app = createCancellableCopilotHonoHandler({
    runtime,
    basePath,
    ...options,
  });
  const threadId = randomUUID();
  t.after(async () => {
    for (const connection of agent.connections.values()) {
      connection.finish();
    }
    await setImmediate();
  });
  function request(runId: string = randomUUID(), signal?: AbortSignal) {
    const connection = new FakeConnection();
    agent.connections.set(runId, connection);
    const input: RunAgentInput = {
      threadId,
      runId,
      messages: [],
      tools: [],
      context: [],
      state: {},
      forwardedProps: {},
    };
    const url =
      options.mode === "single-route"
        ? `http://localhost${basePath}`
        : `http://localhost${basePath}/agent/default/run`;
    const req = new Request(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: "https://ui.test",
      },
      body: JSON.stringify(
        options.mode === "single-route"
          ? { method: "agent/run", params: { agentId: "default" }, body: input }
          : input,
      ),
      signal,
    });
    const response = Promise.resolve(app.fetch(req));
    return { connection, response, input, req };
  }
  return { agent, app, runner, stop, threadId, request, runtime };
}

for (const basePath of ["/copilotkit/codex", "/copilotkit/wordle"]) {
  void test(`${basePath}: request abort stops only the matching run`, async (t) => {
    const { request, runner, stop } = fixture(t, { basePath });
    const controller = new AbortController();
    const run = request(undefined, controller.signal);
    const response = await run.response;
    await run.connection.started.promise;
    assert.equal(response.status, 200);
    controller.abort();
    await setImmediate();
    assert.equal(run.connection.closed, 1);
    assert.equal(run.connection.aborted, 1);
    assert.equal(await runner.isRunning(run.input), false);
    assert.deepEqual(
      stop.mock.calls.map((call) => call.arguments),
      [[{ threadId: run.input.threadId, runId: run.input.runId }]],
    );
    await response.text();
  });
}

void test(
  "live HTTP disconnect closes its connection and leaves another thread running",
  { timeout: 5000 },
  async (t) => {
    const f = fixture(t);
    const other = fixture(t, { basePath: "/copilotkit/wordle" });
    const otherRun = other.request();
    const otherResponse = await otherRun.response;
    await otherRun.connection.started.promise;
    const server = serve({
      fetch: f.app.fetch,
      hostname: "127.0.0.1",
      port: 0,
    });
    t.after(
      () =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
          if ("closeAllConnections" in server) {
            server.closeAllConnections();
          }
        }),
    );
    await once(server, "listening");
    const address = server.address();
    assert.ok(address && typeof address !== "string");
    const connection = new FakeConnection();
    const runId = randomUUID();
    f.agent.connections.set(runId, connection);
    const controller = new AbortController();
    const response = await fetch(
      `http://127.0.0.1:${address.port}/copilotkit/codex/agent/default/run`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          threadId: f.threadId,
          runId,
          messages: [],
          state: {},
          context: [],
          tools: [],
          forwardedProps: {},
        }),
        signal: controller.signal,
      },
    );
    const reader = response.body!.getReader();
    await reader.read();
    controller.abort();
    await reader.cancel().catch(() => {});
    reader.releaseLock();
    await connection.disconnected.promise;
    assert.equal(connection.closed, 1);
    assert.equal(await f.runner.isRunning({ threadId: f.threadId }), false);
    assert.equal(await other.runner.isRunning(otherRun.input), true);
    assert.equal(otherRun.connection.closed, 0);
    otherRun.connection.finish();
    await otherResponse.text();
  },
);

void test("reader.cancel stops the matching run without aborting the request", async (t) => {
  const { request, runner, stop } = fixture(t);
  const run = request();
  const response = await run.response;
  const reader = response.body!.getReader();
  await reader.read();
  // Assert teardown before awaiting cancellation so the unfixed handler fails
  // deterministically instead of hanging on its internal response clone.
  const cancellation = reader.cancel();
  await setImmediate();
  assert.equal(run.connection.closed, 1);
  assert.equal(await runner.isRunning(run.input), false);
  assert.equal(stop.mock.callCount(), 1);
  assert.equal(run.req.signal.aborted, false);
  await cancellation;
  reader.releaseLock();
});

for (const phase of [
  "before dispatch",
  "handler hook",
  "agent initialization",
  "runner registration",
] as const) {
  void test(`abort during startup: ${phase}`, async (t) => {
    const entered = Promise.withResolvers<void>();
    const release = Promise.withResolvers<void>();
    t.after(() => release.resolve());
    const controller = new AbortController();
    const f = fixture(t, {
      hooks:
        phase === "handler hook"
          ? {
              async onBeforeHandler() {
                entered.resolve();
                await release.promise;
              },
            }
          : undefined,
    });
    if (phase === "agent initialization") {
      f.agent.subscribe({
        async onRunInitialized() {
          entered.resolve();
          await release.promise;
        },
      });
    }
    if (phase === "runner registration") {
      const realRun = f.runner.run.bind(f.runner);
      t.mock.method(f.runner, "run", (request: AgentRunnerRunRequest) => {
        controller.abort();
        return realRun(request);
      });
    }
    if (phase === "before dispatch") {
      controller.abort();
    }
    const run = f.request(undefined, controller.signal);
    if (phase === "handler hook" || phase === "agent initialization") {
      await entered.promise;
      controller.abort();
      await setImmediate();
      release.resolve();
    }
    const response = await run.response;
    await response.text();
    await setImmediate();
    assert.equal(await f.runner.isRunning(run.input), false);
    assert.equal(
      run.connection.closed,
      0,
      "must not open a native connection after abort",
    );
    assert.equal(run.connection.aborted, 0);
    assert.equal(getEventListeners(run.req.signal, "abort").length, 0);
    assert.equal(
      f.stop.mock.callCount(),
      phase === "agent initialization" || phase === "runner registration"
        ? 1
        : 0,
    );
  });
}

void test("reader cancellation during initialization cannot leave a background run", async (t) => {
  const f = fixture(t);
  const entered = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  t.after(() => release.resolve());
  f.agent.subscribe({
    async onRunInitialized() {
      entered.resolve();
      await release.promise;
    },
  });
  const run = f.request();
  const response = await run.response;
  await entered.promise;
  const reader = response.body!.getReader();
  const cancellation = reader.cancel();
  await setImmediate();
  assert.equal(await f.runner.isRunning(run.input), false);
  release.resolve();
  await cancellation;
  reader.releaseLock();
  assert.equal(run.connection.closed, 0);
  assert.equal(f.stop.mock.callCount(), 1);
});

void test("a delayed old-request stop cannot stop a superseding run on the same thread", async (t) => {
  const f = fixture(t);
  const controller = new AbortController();
  const old = f.request("old", controller.signal);
  const oldResponse = await old.response;
  await old.connection.started.promise;
  const stopping = Promise.withResolvers<void>();
  const release = Promise.withResolvers<void>();
  t.after(() => release.resolve());
  const realStop = f.runner.stop.bind(f.runner);
  const delayedStop = t.mock.method(
    f.runner,
    "stop",
    async (request: AgentRunnerStopRequest) => {
      stopping.resolve();
      await release.promise;
      return realStop(request);
    },
  );
  controller.abort();
  await stopping.promise;
  const newer = f.request("new");
  const newerResponse = await newer.response;
  await newer.connection.started.promise;
  release.resolve();
  await setImmediate();
  assert.equal(await f.runner.isRunning(newer.input), true);
  assert.equal(newer.connection.closed, 0);
  assert.equal(newer.connection.aborted, 0);
  assert.equal(old.connection.closed, 1);
  assert.deepEqual(
    delayedStop.mock.calls.map((call) => call.arguments),
    [[{ threadId: old.input.threadId, runId: "old" }]],
  );
  await oldResponse.body!.cancel();
  newer.connection.finish();
  await newerResponse.text();
});

void test("connect/replay and status requests do not own the live run", async (t) => {
  // Enable upstream's after-request consumer so cancelling an unwrapped connect
  // response does not hang on its internal tee. Run tests leave that tee unread.
  const f = fixture(t, {}, true);
  const run = f.request();
  const response = await run.response;
  await run.connection.started.promise;
  const controller = new AbortController();
  const connect = await f.app.request(
    "/copilotkit/codex/agent/default/connect",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(run.input),
      signal: controller.signal,
    },
  );
  assert.equal(connect.status, 200);
  const reader = connect.body!.getReader();
  await reader.read();
  const cancelled = reader.cancel();
  // Do not abort until after completion: upstream intentionally unsubscribes a
  // connect request on abort without closing its SSE writer (not our policy).
  assert.equal(await f.runner.isRunning(run.input), true);
  assert.equal(f.stop.mock.callCount(), 0);
  const status = await f.app.request(
    `/copilotkit/codex/threads/${f.threadId}/events`,
  );
  await status.text();
  assert.equal(f.stop.mock.callCount(), 0);
  run.connection.finish();
  await response.text();
  await cancelled;
  reader.releaseLock();
  controller.abort();
  assert.equal(run.connection.aborted, 0);
});

void test("single-route agent/run also uses the accepted runner IDs", async (t) => {
  const f = fixture(t, { mode: "single-route" });
  const controller = new AbortController();
  const run = f.request(undefined, controller.signal);
  const response = await run.response;
  await run.connection.started.promise;
  controller.abort();
  await setImmediate();
  assert.equal(run.connection.closed, 1);
  assert.equal(await f.runner.isRunning(run.input), false);
  await response.text();
});

void test("normal completion preserves SSE, CORS, hooks, and removes abort listeners", async (t) => {
  const { request, stop } = fixture(t, {
    cors: { origin: "https://ui.test", credentials: true },
    hooks: {
      onResponse({ response }) {
        response.headers.set("X-Test-Hook", "preserved");
      },
    },
  });
  const controller = new AbortController();
  const run = request(undefined, controller.signal);
  const response = await run.response;
  await run.connection.started.promise;
  run.connection.finish();
  const text = await response.text();
  assert.match(text, /data: .*"type":"RUN_STARTED"/);
  assert.match(text, /data: .*"type":"RUN_FINISHED"/);
  assert.equal(response.headers.get("Content-Type"), "text/event-stream");
  assert.equal(response.headers.get("Cache-Control"), "no-cache");
  assert.equal(response.headers.get("Connection"), "keep-alive");
  assert.equal(
    response.headers.get("Access-Control-Allow-Origin"),
    "https://ui.test",
  );
  assert.equal(
    response.headers.get("Access-Control-Allow-Credentials"),
    "true",
  );
  assert.equal(response.headers.get("X-Test-Hook"), "preserved");
  assert.equal(getEventListeners(run.req.signal, "abort").length, 0);
  controller.abort();
  assert.equal(stop.mock.callCount(), 0);
  assert.equal(run.connection.closed, 1);
  assert.equal(run.connection.aborted, 0);
});
