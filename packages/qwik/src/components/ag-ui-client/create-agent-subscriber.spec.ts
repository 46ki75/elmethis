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
    isRunning: false,
    status: "idle",
    activity: "idle",
    pendingInterrupts: [],
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

  test("onRunFinalized fires onIdle when no tool round-trip is pending", async () => {
    const state = makeState({ isRunning: true, status: "success" });
    const onIdle = vi.fn();
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
      onIdle,
    });

    await call(sub, "onRunFinalized");

    expect(onIdle).toHaveBeenCalledTimes(1);
    expect(state.isRunning).toBe(false);
  });

  test("onRunFinalized does NOT fire onIdle while a tool round-trip is pending", async () => {
    const tools: ToolRegistry = {
      echo: defineTool({
        description: "echo",
        schema: z.object({ v: z.string() }),
        execute: ({ v }) => v,
      }),
    };
    const state = makeState();
    const onIdle = vi.fn();
    const sub = createAgentSubscriber({
      state,
      getTools: () => tools,
      onNeedsReRun: vi.fn(),
      onIdle,
    });

    await call(sub, "onToolCallEndEvent", {
      event: { toolCallId: "tc1" },
      toolCallName: "echo",
      toolCallArgs: { v: "x" },
    });
    // A follow-up run is imminent (onNeedsReRun path) — idle has NOT settled.
    await call(sub, "onRunFinalized");
    expect(onIdle).not.toHaveBeenCalled();

    // The follow-up run finalizes with nothing pending — now idle fires.
    await call(sub, "onRunFinalized");
    expect(onIdle).toHaveBeenCalledTimes(1);
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
    expect(state.status).toBe("error");
  });

  // -------------------------------------------------------------------------
  // Run status + live activity (for status indicators).
  // -------------------------------------------------------------------------

  test("onRunInitialized enters running and clears prior interrupts", () => {
    const state = makeState({
      status: "awaiting_input",
      activity: "thinking",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      pendingInterrupts: [{ id: "i0" } as any],
    });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onRunInitialized");

    expect(state.status).toBe("running");
    expect(state.activity).toBe("idle");
    expect(state.pendingInterrupts).toEqual([]);
  });

  test("onRunFinishedEvent with a success outcome sets status=success", () => {
    const state = makeState({ status: "running", activity: "writing" });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onRunFinishedEvent", { outcome: "success", event: {} });

    expect(state.status).toBe("success");
    expect(state.activity).toBe("idle");
  });

  test("onRunFinishedEvent stays running when a tool round-trip is queued", async () => {
    const tools: ToolRegistry = {
      echo: defineTool({
        description: "echo",
        schema: z.object({ v: z.string() }),
        execute: ({ v }) => v,
      }),
    };
    const state = makeState({ status: "running" });
    const sub = createAgentSubscriber({
      state,
      getTools: () => tools,
      onNeedsReRun: vi.fn(),
    });

    // A frontend tool result is pending, so a follow-up run is imminent — the
    // success outcome must not flash "success" before it restarts.
    await call(sub, "onToolCallEndEvent", {
      event: { toolCallId: "tc1" },
      toolCallName: "echo",
      toolCallArgs: { v: "x" },
    });
    call(sub, "onRunFinishedEvent", { outcome: "success", event: {} });

    expect(state.status).toBe("running");
  });

  test("onRunFinishedEvent with an interrupt awaits input and copies interrupts", () => {
    const state = makeState({ status: "running" });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    const interrupts = [{ id: "i1", reason: "confirmation" }];
    call(sub, "onRunFinishedEvent", {
      outcome: "interrupt",
      interrupts,
      event: {},
    });

    expect(state.status).toBe("awaiting_input");
    expect(state.pendingInterrupts).toEqual(interrupts);
    // Copied, not aliased — resuming must not mutate the SDK's own array.
    expect(state.pendingInterrupts).not.toBe(interrupts);
  });

  test("onRunFailed maps an AbortError to status=aborted, not error", () => {
    const state = makeState({ status: "running", isRunning: true });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    const aborted = new Error("The operation was aborted");
    aborted.name = "AbortError";
    call(sub, "onRunFailed", { error: aborted });

    expect(state.status).toBe("aborted");
    expect(state.error).toBeNull();
    expect(state.isRunning).toBe(false);
  });

  test("onRunFailed maps a real error to status=error", () => {
    const state = makeState({ status: "running" });
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onRunFailed", { error: new Error("boom") });

    expect(state.status).toBe("error");
    expect(state.error).toBe("boom");
  });

  test("activity tracks the latest started sub-activity and resets at run end", async () => {
    const state = makeState();
    const sub = createAgentSubscriber({
      state,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });

    call(sub, "onReasoningStartEvent", { event: {} });
    expect(state.activity).toBe("thinking");

    call(sub, "onTextMessageStartEvent", { event: {} });
    expect(state.activity).toBe("writing");

    call(sub, "onToolCallStartEvent", { event: {} });
    expect(state.activity).toBe("calling_tool");

    call(sub, "onStateDeltaEvent", { event: {} });
    expect(state.activity).toBe("updating_state");

    await call(sub, "onRunFinalized");
    expect(state.activity).toBe("idle");
  });
});
