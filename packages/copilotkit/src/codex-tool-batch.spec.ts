import assert from "node:assert/strict";
import { test } from "node:test";
import { CodexToolBatch, type StateToolResult } from "./codex-tool-batch.ts";

const turn = { threadId: "native-thread", turnId: "native-turn" };
const frontend = "elmethis_frontend";
const state = "ag_ui_update_state";
function fixture() {
  const handedOff: { id: string; name: string; args: unknown }[] = [];
  const updates: unknown[] = [];
  const replies: { id: string | number; result: StateToolResult }[] = [];
  let finished = 0;
  const batch = new CodexToolBatch({
    frontendNamespace: frontend,
    frontendNames: new Map([["weather", "weather"]]),
    stateToolName: state,
    validateState: (args) => args !== false,
    frontend: (id, name, args) => {
      handedOff.push({ id, name, args });
    },
    updateState(args) {
      updates.push(args);
      return {
        success: args !== false,
        contentItems: [{ type: "inputText", text: JSON.stringify(args) }],
      };
    },
    cancelBackend() {},
    respond: (id, result) => {
      replies.push({ id, result });
    },
    finish: () => {
      finished++;
    },
  });
  const start = () =>
    batch.start({ threadId: turn.threadId, turn: { id: turn.turnId } });
  const raw = (
    id: string,
    tool: string,
    namespace: string | null,
    args: unknown = {},
  ) => ({
    ...turn,
    item: {
      type: "function_call",
      call_id: id,
      name: tool,
      namespace,
      arguments: JSON.stringify(args),
    },
  });
  const request = (id: string, tool: string, namespace: string | null) =>
    batch.request(`rpc-${id}`, {
      ...turn,
      callId: id,
      tool,
      namespace,
      arguments: {},
    });
  return {
    batch,
    start,
    raw,
    request,
    handedOff,
    updates,
    replies,
    finished: () => finished,
  };
}

void test("an early callback cannot finish before all raw calls and the response boundary", () => {
  const f = fixture();
  f.start();
  f.batch.capture(f.raw("Tokyo", "weather", frontend, { city: "Tokyo" }));
  f.request("Tokyo", "weather", frontend);
  assert.deepEqual(f.handedOff, []);
  assert.equal(f.finished(), 0);
  f.batch.capture(f.raw("Osaka", "weather", frontend, { city: "Osaka" }));
  f.batch.capture(f.raw("state", state, null, { counter: 2 }));
  f.batch.complete(turn);
  assert.deepEqual(f.handedOff, [
    { id: "Tokyo", name: "weather", args: { city: "Tokyo" } },
    { id: "Osaka", name: "weather", args: { city: "Osaka" } },
  ]);
  assert.deepEqual(f.updates, [{ counter: 2 }]);
  assert.deepEqual(f.replies, []);
  assert.equal(f.finished(), 1);
});

void test("state-only batches apply once in output order and correlate early/late requests", () => {
  const f = fixture();
  f.start();
  f.batch.capture(f.raw("first", state, null, { counter: 1 }));
  f.request("first", state, null);
  f.batch.capture(f.raw("second", state, null, { counter: 2 }));
  assert.deepEqual(f.updates, []);
  f.batch.complete(turn);
  assert.deepEqual(f.updates, [{ counter: 1 }, { counter: 2 }]);
  assert.deepEqual(
    f.replies.map((reply) => reply.id),
    ["rpc-first"],
  );
  f.request("second", state, null);
  assert.deepEqual(
    f.replies.map((reply) => reply.id),
    ["rpc-first", "rpc-second"],
  );
  assert.equal(f.replies[1]?.result.contentItems[0]?.text, '{"counter":2}');
  assert.equal(f.finished(), 0);
  f.batch.complete(turn);
  assert.equal(f.updates.length, 2);
});

void test("multiple upstream responses do not replay previously handled state calls", () => {
  const f = fixture();
  f.start();
  f.batch.capture(f.raw("first", state, null, { counter: 1 }));
  f.batch.complete(turn);
  f.request("first", state, null);
  f.batch.capture(f.raw("frontend", "weather", frontend));
  f.batch.complete(turn);
  assert.equal(f.updates.length, 1);
  assert.equal(f.replies.length, 1);
  assert.equal(f.handedOff.length, 1);
  assert.equal(f.finished(), 1);
});

void test("history before turn/started and unrelated turn notifications are ignored", () => {
  const f = fixture();
  f.batch.capture(f.raw("historical", "weather", frontend));
  f.batch.complete(turn);
  f.start();
  f.batch.capture({
    ...f.raw("other", "weather", frontend),
    turnId: "other-turn",
  });
  f.batch.capture(f.raw("current", "weather", frontend));
  f.batch.complete({ ...turn, threadId: "other-thread" });
  assert.equal(f.finished(), 0);
  f.batch.complete(turn);
  assert.deepEqual(
    f.handedOff.map((call) => call.id),
    ["current"],
  );
});

void test("duplicate raw call IDs and mismatched requests fail explicitly", () => {
  const f = fixture();
  f.start();
  f.batch.capture(f.raw("one", "weather", frontend));
  assert.throws(
    () => f.batch.capture(f.raw("one", state, null)),
    /duplicate tool call ID/,
  );
  assert.throws(() => f.request("one", state, null), /no matching raw call/);
  assert.throws(
    () =>
      f.batch.request(1, {
        ...turn,
        turnId: "wrong",
        callId: "one",
        tool: "weather",
        namespace: frontend,
        arguments: {},
      }),
    /active turn/,
  );
  assert.throws(
    () => f.batch.capture(f.raw("unknown", "unknown", frontend)),
    /unregistered frontend/,
  );
});

void test("invalid arguments do not become a successful frontend handoff", () => {
  const f = fixture();
  f.start();
  const malformed = f.raw("invalid", "weather", frontend);
  malformed.item.arguments = "not-json";
  assert.throws(
    () => f.batch.capture(malformed),
    /invalid JSON tool arguments/,
  );
  f.batch.capture(f.raw("frontend", "weather", frontend));
  f.batch.capture(f.raw("invalid-state", state, null, false));
  assert.throws(() => f.batch.complete(turn), /Invalid shared-state update/);
  assert.deepEqual(f.handedOff, []);
  assert.deepEqual(f.updates, []);
  assert.equal(f.finished(), 0);
});

void test("invalid state-only calls return a native failure and duplicate requests are rejected", () => {
  const f = fixture();
  f.start();
  f.batch.capture(f.raw("state", state, null, false));
  f.request("state", state, null);
  assert.throws(
    () => f.request("state", state, null),
    /duplicated a state tool request/,
  );
  f.batch.complete(turn);
  assert.equal(f.replies[0]?.result.success, false);
  assert.throws(() => f.request("state", state, null), /no matching raw call/);
  assert.equal(f.finished(), 0);
});
