import { describe, expect, test, vi } from "vitest";
import type { AgentSubscriber, BaseEvent, Message } from "@ag-ui/client";
import { z } from "zod";

import {
  createAgentSubscriber,
  type AgentSubscriberState,
} from "./create-agent-subscriber";
import { defineTool, type ToolRegistry } from "./tool-registry";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeState(
  overrides: Partial<AgentSubscriberState> = {},
): AgentSubscriberState {
  return {
    error: null,
    messages: [],
    events: [],
    isRunning: false,
    ...overrides,
  };
}

/**
 * Call a subscriber method with an event-only payload.
 *
 * The real `AgentSubscriber` callbacks receive `AgentSubscriberParams`
 * (which carries `agent`, `input`, `state`, `messages`) merged with the
 * event-specific fields. The factory's implementation only reads the
 * fields exercised below, so tests pass partial payloads and cast.
 */
function call<K extends keyof AgentSubscriber>(
  sub: AgentSubscriber,
  method: K,
  payload: Record<string, unknown> = {},
) {
  const fn = sub[method];
  if (!fn) throw new Error(`subscriber has no method ${String(method)}`);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (fn as any).call(sub, payload);
}

const assistant = (
  overrides: Partial<Message & { toolCalls?: unknown[] }> = {},
): Message =>
  ({
    id: "m-assistant",
    role: "assistant",
    content: "",
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe("createAgentSubscriber", () => {
  test("satisfies the @ag-ui/client AgentSubscriber type", () => {
    const sub = createAgentSubscriber({
      state: makeState(),
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });
    // Compile-time structural assertion.
    const _typed: AgentSubscriber = sub;
    expect(_typed).toBeDefined();
  });

  test("onRunInitialized flips isRunning on and clears any prior error", () => {
    const state = makeState({ error: "stale" });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });
    call(sub, "onRunInitialized");
    expect(state.isRunning).toBe(true);
    expect(state.error).toBeNull();
  });

  // -------------------------------------------------------------------------
  // The core contract: mirror the SDK's reconstructed message list verbatim.
  // -------------------------------------------------------------------------

  test("onMessagesChanged reconciles state.messages in place, preserving identity", () => {
    const state = makeState({ messages: [assistant({ id: "old" })] });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    const arrRef = state.messages;
    call(sub, "onMessagesChanged", {
      messages: [
        assistant({ id: "m1", content: "hi" }),
        assistant({ id: "m2", content: "there" }),
      ],
    });

    // Mutated in place (not reassigned) so the renderer's fine-grained
    // reactivity survives — the array reference is the same object.
    expect(state.messages).toBe(arrRef);
    expect(state.messages.map((m) => m.id)).toEqual(["m1", "m2"]);

    // A second emit with the same ids patches the existing objects in place
    // rather than swapping in new identities (the streaming-repaint contract).
    const firstObj = state.messages[0];
    call(sub, "onMessagesChanged", {
      messages: [
        assistant({ id: "m1", content: "hi there" }),
        assistant({ id: "m2", content: "there" }),
      ],
    });
    expect(state.messages[0]).toBe(firstObj);
    expect(state.messages[0].content).toBe("hi there");
  });

  test("onMessagesChanged reflects streaming growth on each call", () => {
    const state = makeState();
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    // The SDK hands a freshly-rebuilt array on every delta; the subscriber
    // mirrors whatever it receives — no local accumulation.
    call(sub, "onMessagesChanged", {
      messages: [assistant({ id: "a", content: "He" })],
    });
    expect(state.messages[0].content).toBe("He");

    call(sub, "onMessagesChanged", {
      messages: [assistant({ id: "a", content: "Hello" })],
    });
    expect(state.messages[0].content).toBe("Hello");
  });

  // -------------------------------------------------------------------------
  // Event timeline is opt-in and isolated from message handling.
  // -------------------------------------------------------------------------

  test("onEvent is a no-op when collectEvents is false (default)", () => {
    const state = makeState();
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onEvent", {
      event: { type: "TEXT_MESSAGE_CONTENT", messageId: "m1", delta: "x" },
    });

    expect(state.events).toEqual([]);
  });

  test("onEvent compacts into state.events when collectEvents is true", () => {
    const state = makeState();
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
      collectEvents: true,
    });

    const event = { type: "TEXT_MESSAGE_CONTENT", messageId: "m3", delta: "x" };
    call(sub, "onEvent", { messages: [], event });

    expect(state.events).toContainEqual(event);
  });

  test("onEvent does not touch messages even when collecting events", () => {
    const state = makeState({ messages: [assistant({ id: "m1" })] });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
      collectEvents: true,
    });

    const before = state.messages;
    call(sub, "onEvent", {
      messages: [assistant({ id: "m1" }), assistant({ id: "m2" })],
      event: { type: "RUN_STARTED" },
    });

    // Message sync is owned exclusively by onMessagesChanged.
    expect(state.messages).toBe(before);
    expect(state.messages.map((m) => m.id)).toEqual(["m1"]);
  });

  // -------------------------------------------------------------------------
  // Frontend tool execution.
  // -------------------------------------------------------------------------

  test("onToolCallEndEvent runs the registered tool with the SDK-parsed args", async () => {
    const tools: ToolRegistry = {
      addOne: defineTool({
        description: "add 1",
        schema: z.object({ n: z.number() }),
        execute: ({ n }) => ({ result: n + 1 }),
      }),
    };
    const state = makeState();
    const onNeedsReRun = vi.fn();
    const sub = createAgentSubscriber({
      state,
      getTools: () => tools,
      onNeedsReRun,
    });

    // The SDK assembles + JSON-parses args and passes them as `toolCallArgs`.
    await call(sub, "onToolCallEndEvent", {
      event: { toolCallId: "tc1" },
      toolCallName: "addOne",
      toolCallArgs: { n: 2 },
    });

    // Tool message not yet flushed to state — that happens on onRunFinalized.
    expect(state.messages).toHaveLength(0);

    await call(sub, "onRunFinalized");
    expect(onNeedsReRun).toHaveBeenCalledTimes(1);
    const queued: Message[] = onNeedsReRun.mock.calls[0][0];
    expect(queued).toHaveLength(1);
    expect(queued[0].role).toBe("tool");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((queued[0] as any).toolCallId).toBe("tc1");
    expect(queued[0].content).toBe(JSON.stringify({ result: 3 }));
  });

  test("onToolCallEndEvent is a no-op when the tool name is not in the registry", async () => {
    const state = makeState();
    const onNeedsReRun = vi.fn();
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun,
    });

    await call(sub, "onToolCallEndEvent", {
      event: { toolCallId: "tc1" },
      toolCallName: "ghost",
      toolCallArgs: {},
    });
    await call(sub, "onRunFinalized");

    expect(onNeedsReRun).not.toHaveBeenCalled();
    expect(state.isRunning).toBe(false);
  });

  test("onRunFinalized with empty pending sets isRunning=false and does NOT re-run", async () => {
    const state = makeState({ isRunning: true });
    const onNeedsReRun = vi.fn();
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun,
    });

    await call(sub, "onRunFinalized");

    expect(state.isRunning).toBe(false);
    expect(onNeedsReRun).not.toHaveBeenCalled();
  });

  test("onRunFinalized with pending fires onNeedsReRun once; second call does not re-fire", async () => {
    const tools: ToolRegistry = {
      echo: defineTool({
        description: "echo",
        schema: z.object({ v: z.string() }),
        execute: ({ v }) => v,
      }),
    };
    const state = makeState();
    const onNeedsReRun = vi.fn();
    const sub = createAgentSubscriber({
      state,
      getTools: () => tools,
      onNeedsReRun,
    });

    await call(sub, "onToolCallEndEvent", {
      event: { toolCallId: "tc1" },
      toolCallName: "echo",
      toolCallArgs: { v: "x" },
    });
    await call(sub, "onRunFinalized");
    expect(onNeedsReRun).toHaveBeenCalledTimes(1);

    // A second onRunFinalized — with no new tool calls — must NOT re-fire.
    await call(sub, "onRunFinalized");
    expect(onNeedsReRun).toHaveBeenCalledTimes(1);
    expect(state.isRunning).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Error paths both surface a message AND clear isRunning.
  // -------------------------------------------------------------------------

  test("onRunFailed writes error.message and clears isRunning", () => {
    const state = makeState({ isRunning: true });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onRunFailed", { error: new Error("boom") });

    expect(state.error).toBe("boom");
    expect(state.isRunning).toBe(false);
  });

  test("onRunErrorEvent writes event.message and clears isRunning (separate code path)", () => {
    const state = makeState({ isRunning: true });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onRunErrorEvent", { event: { message: "transport down" } });

    expect(state.error).toBe("transport down");
    expect(state.isRunning).toBe(false);
  });

  // -------------------------------------------------------------------------
  // Reactivity-edge-case guards.
  // -------------------------------------------------------------------------

  test("plain-object state works for both the in-place message and events paths", () => {
    // The production code mutates `state.messages` in place (via
    // onMessagesChanged → reconcileMessages) AND reassigns `state.events`
    // (via onEvent). Both must work on a vanilla object so we don't
    // accidentally introduce a Qwik-proxy-only access path.
    const state = makeState();
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
      collectEvents: true,
    });

    call(sub, "onMessagesChanged", {
      messages: [assistant({ id: "m1", content: "" })],
    });
    expect(state.messages.map((m) => m.id)).toEqual(["m1"]);

    const beforeEvents = state.events;
    call(sub, "onEvent", { messages: [], event: { type: "T", a: 1 } });
    call(sub, "onEvent", { messages: [], event: { type: "T", a: 2 } });
    expect(state.events).not.toBe(beforeEvents); // new array reference
    expect(state.events).toHaveLength(2);
  });

  test("event collection does not feed reactive store reads back into structuredClone", () => {
    // Regression: production `state` is a Qwik `useStore` proxy, so reading
    // `state.events` back returns reactive proxies. For STATE_SNAPSHOT/
    // STATE_DELTA events `compactEvents` deep-clones the payload via
    // `structuredClone`, which throws `DataCloneError` on a proxy. We simulate
    // that here with a getter that "poisons" reads with a non-cloneable value;
    // the subscriber must read its own plain accumulator instead, so a second
    // state event compacts without throwing.
    let backing: BaseEvent[] = [];
    const state = {
      error: null,
      messages: [] as Message[],
      isRunning: false,
      get events() {
        return backing.map((e) =>
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (e as any).type === "STATE_SNAPSHOT"
            ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
              { ...e, snapshot: { ...(e as any).snapshot, fn: () => {} } }
            : e,
        );
      },
      set events(v: BaseEvent[]) {
        backing = v;
      },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } as any as AgentSubscriberState;

    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
      collectEvents: true,
    });

    call(sub, "onEvent", {
      messages: [],
      event: { type: "STATE_SNAPSHOT", snapshot: { a: 1 } },
    });
    expect(() =>
      call(sub, "onEvent", {
        messages: [],
        event: {
          type: "STATE_DELTA",
          delta: [{ op: "add", path: "/b", value: 2 }],
        },
      }),
    ).not.toThrow();

    // Both state events collapse into one merged STATE_SNAPSHOT.
    expect(backing).toHaveLength(1);
    expect(backing[0]).toMatchObject({
      type: "STATE_SNAPSHOT",
      snapshot: { a: 1, b: 2 },
    });
  });
});
