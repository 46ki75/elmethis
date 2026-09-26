import type { AgentSubscriber, Message } from "@ag-ui/client";
import { describe, expect, it, vi } from "vitest";
import { z } from "zod";

import {
  createAgentSubscriber,
  type AgentSubscriberState,
} from "./create-agent-subscriber";
import { defineTool, type ToolRegistry } from "./tool-registry";

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
  if (!subscriber[method]) {
    throw new Error(`Missing subscriber method: ${method}`);
  }
  return (
    subscriber[method] as (value: Record<string, unknown>) => unknown
  ).call(subscriber, payload);
};

describe("createAgentSubscriber", () => {
  it("tracks lifecycle, activity, and interrupts", () => {
    const current = state();
    const subscriber = createAgentSubscriber({
      state: current,
      getTools: () => ({}),
      onNeedsReRun: vi.fn(),
    });
    call(subscriber, "onRunInitialized", { input: { tools: [] } });
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

  it("does not execute backend-origin calls added to the registry mid-run", async () => {
    const execute = vi.fn();
    const rerun = vi.fn();
    let tools: ToolRegistry = {};
    const subscriber = createAgentSubscriber({
      state: state(),
      getTools: () => tools,
      onNeedsReRun: rerun,
    });
    call(subscriber, "onRunInitialized", { input: { tools: [] } });
    call(subscriber, "onToolCallStartEvent", {
      event: {
        toolCallId: "backend-call",
        metadata: { elmethisCodexTool: "backend" },
      },
    });
    tools = {
      mcp__aws_knowledge__search: defineTool({
        description: "Late browser tool",
        schema: z.object({}),
        execute,
      }),
    };
    await call(subscriber, "onToolCallEndEvent", {
      event: { toolCallId: "backend-call" },
      toolCallName: "mcp__aws_knowledge__search",
      toolCallArgs: {},
    });
    await call(subscriber, "onRunFinalized");
    expect(execute).not.toHaveBeenCalled();
    expect(rerun).not.toHaveBeenCalled();
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
    call(subscriber, "onRunInitialized", {
      input: { tools: [{ name: "increment" }] },
    });
    call(subscriber, "onToolCallStartEvent", {
      event: {
        toolCallId: "tc1",
        metadata: { elmethisCodexTool: "frontend" },
      },
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
