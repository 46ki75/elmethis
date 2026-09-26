import assert from "node:assert/strict";
import { test } from "node:test";
import { CopilotRuntime, InMemoryAgentRunner } from "@copilotkit/runtime/v2";
import { Subject } from "rxjs";
import { createCancellableCopilotHonoHandler } from "./cancellable-handler.ts";
import { CodexAgentAdapter } from "./codex-agent.ts";
import type { CodexMessage } from "./codex-rpc.ts";

void test(
  "HTTP abort tears down the real Codex adapter without waiting for native completion",
  { timeout: 5000 },
  async (t) => {
    const events = new Subject<CodexMessage>();
    const started = Promise.withResolvers<void>();
    const disconnected = Promise.withResolvers<void>();
    let closed = 0;
    const agent = new CodexAgentAdapter({
      agentId: "default",
      connectionFactory: () => ({
        events,
        notify() {},
        respond() {},
        close() {
          closed++;
          disconnected.resolve();
        },
        request(method) {
          if (method === "account/read") {
            return Promise.resolve({ account: { type: "chatgpt" } });
          }
          if (method === "thread/start") {
            return Promise.resolve({ thread: { id: "native" } });
          }
          if (method === "turn/start") {
            started.resolve();
          }
          return Promise.resolve({});
        },
      }),
    });
    t.after(() =>
      events.next({
        method: "turn/completed",
        params: { turn: { status: "completed" } },
      }),
    );
    const runner = new InMemoryAgentRunner();
    const runtime = new CopilotRuntime({
      agents: { default: agent },
      runner,
      ɵtelemetry: { capture: () => Promise.resolve() },
    });
    const app = createCancellableCopilotHonoHandler({
      runtime,
      basePath: "/copilotkit/codex",
    });
    const controller = new AbortController();
    const response = await app.request("/copilotkit/codex/agent/default/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      body: JSON.stringify({
        threadId: "http-codex",
        runId: "run",
        messages: [{ id: "user", role: "user", content: "Hello" }],
        state: {},
        tools: [],
        context: [],
        forwardedProps: {},
      }),
    });
    await started.promise;
    controller.abort();
    await disconnected.promise;
    assert.equal(closed, 1);
    assert.equal(await runner.isRunning({ threadId: "http-codex" }), false);
    await response.text();
  },
);
