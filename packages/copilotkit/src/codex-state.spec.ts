import assert from "node:assert/strict";
import { test } from "node:test";
import { InMemoryAgentRunner } from "@copilotkit/runtime/v2";
import { EventType, type RunAgentInput } from "@ag-ui/core";
import { Subject, lastValueFrom, toArray } from "rxjs";
import { CodexAgentAdapter } from "./codex-agent.ts";
import type { CodexConnection, CodexMessage, RpcId } from "./codex-rpc.ts";
import { emitDynamicBatch, startNativeTurn } from "./fixtures/codex-events.ts";

const input: RunAgentInput = {
  threadId: "state-thread",
  runId: "state-run",
  messages: [{ id: "user", role: "user", content: "Update counter" }],
  state: { counter: 1, preserved: "yes" },
  tools: [],
  context: [],
  forwardedProps: {},
};

function fixture(onTurn: (events: Subject<CodexMessage>) => void) {
  const events = new Subject<CodexMessage>();
  const requests: { method: string; params: unknown }[] = [];
  const replies: { id: RpcId; result: unknown }[] = [];
  const connection: CodexConnection = {
    events,
    request(method, params) {
      requests.push({ method, params });
      if (method === "account/read") {
        return Promise.resolve({ account: { type: "chatgpt" } });
      }
      if (method === "thread/start") {
        return Promise.resolve({ thread: { id: "native" } });
      }
      if (method === "turn/start") {
        queueMicrotask(() => {
          startNativeTurn(events);
          onTurn(events);
        });
      }
      return Promise.resolve({});
    },
    respond(id, result) {
      replies.push({ id, result });
    },
    notify() {},
    close() {},
  };
  const agent = new CodexAgentAdapter({
    agentId: "default",
    threadId: input.threadId,
    initialState: input.state as unknown,
    initialMessages: input.messages,
    connectionFactory: () => connection,
  });
  return { agent, requests, replies };
}
const finish = (events: Subject<CodexMessage>) =>
  events.next({
    method: "turn/completed",
    params: { turn: { status: "completed" } },
  });

void test("persists initial shared state in the real runner's replay", async () => {
  const { agent, requests } = fixture(finish);
  const runner = new InMemoryAgentRunner();
  await lastValueFrom(
    runner.run({ threadId: input.threadId, agent, input }).pipe(toArray()),
  );
  assert.deepEqual(runner.getThreadState(input.threadId), input.state);
  const params = requests.find(
    (request) => request.method === "thread/start",
  )?.params;
  assert.ok(params && typeof params === "object");
  assert.match(
    JSON.stringify(Reflect.get(params, "dynamicTools")),
    /ag_ui_update_state/,
  );
});

void test("handles state updates server-side, shallow-merges, and keeps the native turn running", async () => {
  const { agent, replies } = fixture((events) => {
    emitDynamicBatch(events, [
      {
        id: 42,
        callId: "state-call",
        tool: "ag_ui_update_state",
        arguments: { state_updates: { counter: 2 } },
      },
    ]);
    events.next({
      method: "item/completed",
      params: { item: { id: "answer", type: "agentMessage", text: "Updated" } },
    });
    finish(events);
  });
  const runner = new InMemoryAgentRunner();
  const events = await lastValueFrom(
    runner.run({ threadId: input.threadId, agent, input }).pipe(toArray()),
  );
  assert.deepEqual(runner.getThreadState(input.threadId), {
    counter: 2,
    preserved: "yes",
  });
  assert.deepEqual(
    events
      .filter((event) => event.type === EventType.STATE_SNAPSHOT)
      .map((event) => event.snapshot),
    [input.state, { counter: 2, preserved: "yes" }],
  );
  assert.equal(
    events.some((event) => event.type === EventType.TOOL_CALL_START),
    false,
  );
  assert.equal(events.at(-1)?.type, EventType.RUN_FINISHED);
  assert.match(JSON.stringify(replies), /"success":true/);
  assert.match(JSON.stringify(events), /Updated/);
});

void test("rejects malformed state updates without mutating state or ending the run", async () => {
  const { agent, replies } = fixture((events) => {
    emitDynamicBatch(events, [
      {
        id: "bad",
        callId: "state-call",
        tool: "ag_ui_update_state",
        arguments: { state_updates: [] },
      },
    ]);
    finish(events);
  });
  const events = await lastValueFrom(agent.run(input).pipe(toArray()));
  assert.deepEqual(
    events
      .filter((event) => event.type === EventType.STATE_SNAPSHOT)
      .map((event) => event.snapshot),
    [input.state],
  );
  assert.equal(events.at(-1)?.type, EventType.RUN_FINISHED);
  assert.match(JSON.stringify(replies), /"success":false/);
});

void test("an empty input state clears the runner's previous snapshot", async () => {
  const { agent } = fixture(finish);
  const runner = new InMemoryAgentRunner();
  await lastValueFrom(
    runner.run({ threadId: input.threadId, agent, input }).pipe(toArray()),
  );
  agent.setState({});
  await lastValueFrom(
    runner
      .run({
        threadId: input.threadId,
        agent,
        input: { ...input, runId: "reset", state: {} },
      })
      .pipe(toArray()),
  );
  assert.deepEqual(runner.getThreadState(input.threadId), {});
});

void test("multiple state updates compose without changing the supplied input", async () => {
  const { agent, replies } = fixture((events) => {
    for (const [id, state_updates] of [
      { counter: 2 },
      { another: { nested: [true, null] } },
      { counter: 2 },
    ].entries()) {
      emitDynamicBatch(events, [
        {
          id,
          callId: `state-${id}`,
          tool: "ag_ui_update_state",
          arguments: { state_updates },
        },
      ]);
    }
    finish(events);
  });
  const events = await lastValueFrom(agent.run(input).pipe(toArray()));
  const snapshots = events.filter(
    (event) => event.type === EventType.STATE_SNAPSHOT,
  );
  assert.equal(snapshots.length, 3);
  assert.deepEqual(snapshots.at(-1)?.snapshot, {
    counter: 2,
    preserved: "yes",
    another: { nested: [true, null] },
  });
  assert.deepEqual(input.state, { counter: 1, preserved: "yes" });
  assert.deepEqual(
    replies.map((reply) => reply.id),
    [0, 1, 2],
  );
});

void test("does not let frontend tools shadow the reserved state tool", async () => {
  const { agent, requests } = fixture(finish);
  const events = await lastValueFrom(
    agent
      .run({
        ...input,
        tools: [
          {
            name: "ag_ui_update_state",
            description: "Collision",
            parameters: {},
          },
        ],
      })
      .pipe(toArray()),
  );
  assert.equal(events.at(-1)?.type, EventType.RUN_ERROR);
  assert.equal(
    requests.some((request) => request.method === "turn/start"),
    false,
  );
});
