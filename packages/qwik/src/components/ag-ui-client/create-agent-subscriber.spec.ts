import { describe, expect, test, vi } from "vitest";
import type { AgentSubscriber, Message } from "@ag-ui/client";
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
 * event-specific fields, so tests pass partial payloads and cast.
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

const reasoning = (overrides: Partial<Message> = {}): Message =>
  ({
    id: "m-reasoning",
    role: "reasoning",
    content: "",
    ...overrides,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  }) as any;

const activity = (overrides: Partial<Message> = {}): Message =>
  ({
    id: "m-activity",
    role: "activity",
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

  test("onRunInitialized flips state.isRunning to true", () => {
    const state = makeState();
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });
    call(sub, "onRunInitialized");
    expect(state.isRunning).toBe(true);
  });

  test("onEvent appends only the new tail of messages and compacts events", () => {
    const existing: Message = assistant({ id: "m1", content: "hi" });
    const state = makeState({ messages: [existing] });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    const newMessages: Message[] = [
      existing,
      assistant({ id: "m2", content: "second" }),
      assistant({ id: "m3", content: "third" }),
    ];
    const event = { type: "TEXT_MESSAGE_CONTENT", messageId: "m3", delta: "x" };

    call(sub, "onEvent", { messages: newMessages, event });

    expect(state.messages.map((m) => m.id)).toEqual(["m1", "m2", "m3"]);
    expect(state.events).toContainEqual(event);
  });

  test("onTextMessageContentEvent appends delta to the last assistant message", () => {
    const state = makeState({
      messages: [assistant({ id: "m1", content: "Hello, " })],
    });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onTextMessageContentEvent", { event: { delta: "world!" } });

    expect(state.messages[0].content).toBe("Hello, world!");
  });

  test("onTextMessageContentEvent is a no-op when no assistant message exists", () => {
    const state = makeState({ messages: [] });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onTextMessageContentEvent", { event: { delta: "lost" } });

    expect(state.messages).toEqual([]);
  });

  test("onReasoningMessageContentEvent appends to the last reasoning message", () => {
    const state = makeState({
      messages: [
        reasoning({ id: "r1", content: "Thinking " }),
        assistant({ id: "a1", content: "ignored" }),
      ],
    });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onReasoningMessageContentEvent", { event: { delta: "more." } });

    expect(state.messages[0].content).toBe("Thinking more.");
    expect(state.messages[1].content).toBe("ignored");
  });

  test("onActivityDeltaEvent REPLACES the last activity message's content", () => {
    const state = makeState({
      messages: [activity({ id: "ac1", content: "old" })],
    });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onActivityDeltaEvent", {
      activityMessage: { content: "new" },
    });

    expect(state.messages[0].content).toBe("new");
  });

  test("onActivityDeltaEvent is a no-op when activityMessage is missing", () => {
    const state = makeState({
      messages: [activity({ id: "ac1", content: "keep" })],
    });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onActivityDeltaEvent", {});

    expect(state.messages[0].content).toBe("keep");
  });

  test("onToolCallArgsEvent concatenates delta into the matching tool call args", () => {
    const state = makeState({
      messages: [
        assistant({
          id: "a1",
          toolCalls: [
            { id: "tc1", function: { name: "x", arguments: '{"a":' } },
          ],
        }),
      ],
    });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onToolCallArgsEvent", {
      event: { toolCallId: "tc1", delta: "1}" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const args = (state.messages[0] as any).toolCalls[0].function.arguments;
    expect(args).toBe('{"a":1}');
  });

  test("onToolCallArgsEvent is a no-op when toolCallId does not match", () => {
    const state = makeState({
      messages: [
        assistant({
          id: "a1",
          toolCalls: [
            { id: "tc1", function: { name: "x", arguments: "orig" } },
          ],
        }),
      ],
    });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onToolCallArgsEvent", {
      event: { toolCallId: "tc-unknown", delta: "x" },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    expect((state.messages[0] as any).toolCalls[0].function.arguments).toBe(
      "orig",
    );
  });

  test("onToolCallEndEvent runs the registered tool and queues a tool message", async () => {
    const tools: ToolRegistry = {
      addOne: defineTool({
        description: "add 1",
        schema: z.object({ n: z.number() }),
        execute: ({ n }) => ({ result: n + 1 }),
      }),
    };
    const state = makeState({
      messages: [
        assistant({
          id: "a1",
          toolCalls: [
            { id: "tc1", function: { name: "addOne", arguments: '{"n":2}' } },
          ],
        }),
      ],
    });
    const onNeedsReRun = vi.fn();
    const sub = createAgentSubscriber({
      state,
      getTools: () => tools,
      onNeedsReRun,
    });

    await call(sub, "onToolCallEndEvent", {
      event: { toolCallId: "tc1" },
      toolCallName: "addOne",
    });

    // Tool message not yet flushed to state — that happens on onRunFinalized.
    expect(state.messages).toHaveLength(1);

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
    const state = makeState({
      messages: [
        assistant({
          id: "a1",
          toolCalls: [
            { id: "tc1", function: { name: "ghost", arguments: "{}" } },
          ],
        }),
      ],
    });
    const onNeedsReRun = vi.fn();
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun,
    });

    await call(sub, "onToolCallEndEvent", {
      event: { toolCallId: "tc1" },
      toolCallName: "ghost",
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
    const state = makeState({
      messages: [
        assistant({
          id: "a1",
          toolCalls: [
            { id: "tc1", function: { name: "echo", arguments: '{"v":"x"}' } },
          ],
        }),
      ],
    });
    const onNeedsReRun = vi.fn();
    const sub = createAgentSubscriber({
      state,
      getTools: () => tools,
      onNeedsReRun,
    });

    await call(sub, "onToolCallEndEvent", {
      event: { toolCallId: "tc1" },
      toolCallName: "echo",
    });
    await call(sub, "onRunFinalized");
    expect(onNeedsReRun).toHaveBeenCalledTimes(1);

    // A second onRunFinalized — with no new tool calls — must NOT re-fire.
    await call(sub, "onRunFinalized");
    expect(onNeedsReRun).toHaveBeenCalledTimes(1);
    expect(state.isRunning).toBe(false);
  });

  test("onRunFailed writes error.message to state.error", () => {
    const state = makeState();
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onRunFailed", { error: new Error("boom") });

    expect(state.error).toBe("boom");
  });

  test("onRunErrorEvent writes event.message to state.error (separate code path)", () => {
    const state = makeState();
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onRunErrorEvent", { event: { message: "transport down" } });

    expect(state.error).toBe("transport down");
  });

  test("plain-object state works for both .push(...) AND reassignment paths", () => {
    // Reactivity-edge-case guard: the production code uses
    // `state.messages.push(...)` (mutation) AND `state.events = [...]`
    // (reassignment). Both must work on a vanilla object so we don't
    // accidentally introduce a Qwik-proxy-only access path.
    const state = makeState();
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    // .push(...) path — exercised by onEvent's message-tail append.
    call(sub, "onEvent", {
      messages: [assistant({ id: "m1", content: "" })],
      event: { type: "T", a: 1 },
    });
    expect(state.messages.map((m) => m.id)).toEqual(["m1"]);

    // Reassignment path — exercised by onEvent's events compaction.
    const beforeEvents = state.events;
    call(sub, "onEvent", {
      messages: [],
      event: { type: "T", a: 2 },
    });
    expect(state.events).not.toBe(beforeEvents); // new array reference
    expect(state.events).toHaveLength(2);
  });
});
