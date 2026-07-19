import type { AgentSubscriber, Message } from "@ag-ui/client";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  createAgentSubscriber,
  type AgentSubscriberState,
} from "./create-agent-subscriber";
import { defineTool } from "./tool-registry";

const state = (): AgentSubscriberState => ({
  error: null,
  messages: [],
  isRunning: false,
  status: "idle",
  activity: "idle",
  pendingInterrupts: [],
});

const call = (
  subscriber: AgentSubscriber,
  method: keyof AgentSubscriber,
  payload: Record<string, unknown> = {},
) => {
  const callback = subscriber[method];
  if (!callback) throw new Error(`Missing subscriber method: ${method}`);
  return (callback as (value: Record<string, unknown>) => unknown)(payload);
};

describe("createAgentSubscriber", () => {
  it("tracks lifecycle, activity, and interrupts", () => {
    const current = state();
    const subscriber = createAgentSubscriber({
      state: current,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });
    call(subscriber, "onRunInitialized");
    call(subscriber, "onReasoningStartEvent");
    expect(current).toMatchObject({
      isRunning: true,
      status: "running",
      activity: "thinking",
    });

    const interrupts = [{ id: "i1", reason: "confirmation" }];
    call(subscriber, "onRunFinishedEvent", {
      outcome: "interrupt",
      interrupts,
    });
    expect(current.status).toBe("awaiting_input");
    expect(current.pendingInterrupts).toEqual(interrupts);
    expect(current.pendingInterrupts).not.toBe(interrupts);
  });

  it("executes frontend tools and requests a follow-up run", async () => {
    const rerun = vi.fn();
    const subscriber = createAgentSubscriber({
      state: state(),
      getTools: () => ({
        increment: defineTool({
          description: "Increment",
          schema: z.object({ value: z.number() }),
          execute: ({ value }) => ({ value: value + 1 }),
        }),
      }),
      onNeedsReRun: rerun,
    });
    await call(subscriber, "onToolCallEndEvent", {
      event: { toolCallId: "tc1" },
      toolCallName: "increment",
      toolCallArgs: { value: 1 },
    });
    await call(subscriber, "onRunFinalized");

    const messages = rerun.mock.calls[0][0] as Message[];
    expect(messages[0]).toMatchObject({
      role: "tool",
      toolCallId: "tc1",
      content: '{"value":2}',
    });
  });
});
