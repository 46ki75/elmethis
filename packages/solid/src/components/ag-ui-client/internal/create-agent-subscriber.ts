import type { AgentSubscriber, Message } from "@ag-ui/client";
import type { Interrupt, ToolMessage } from "@ag-ui/core";
import { v7 } from "uuid";

import { reconcileMessages } from "./reconcile-messages";
import type { ToolRegistry } from "./tool-registry";

export type AgentRunStatus =
  "idle" | "running" | "success" | "awaiting_input" | "error" | "aborted";
export type AgentActivity =
  "idle" | "thinking" | "writing" | "calling_tool" | "updating_state";

export interface AgentSubscriberState {
  error: string | null;
  messages: Message[];
  isRunning: boolean;
  status: AgentRunStatus;
  activity: AgentActivity;
  pendingInterrupts: Interrupt[];
}

export interface CreateAgentSubscriberOptions {
  state: AgentSubscriberState;
  getTools: () => ToolRegistry;
  onNeedsReRun: (pendingToolMessages: Message[]) => unknown | Promise<unknown>;
  onIdle?: () => unknown | Promise<unknown>;
}

const isAbortError = (error: Error): boolean => error.name === "AbortError";

export function createAgentSubscriber({
  state,
  getTools,
  onNeedsReRun,
  onIdle,
}: CreateAgentSubscriberOptions): AgentSubscriber {
  let pendingToolMessages: Message[] = [];

  return {
    onRunInitialized() {
      state.isRunning = true;
      state.status = "running";
      state.activity = "idle";
      state.error = null;
      state.pendingInterrupts = [];
    },
    onMessagesChanged({ messages }) {
      reconcileMessages(state.messages, messages);
    },
    async onToolCallEndEvent({ event, toolCallName, toolCallArgs }) {
      const tool = getTools()[toolCallName];
      if (!tool) return;
      const toolMessage: ToolMessage = {
        id: v7(),
        role: "tool",
        content: JSON.stringify(await tool.execute(toolCallArgs)),
        toolCallId: event.toolCallId,
      };
      pendingToolMessages.push(toolMessage);
    },
    onTextMessageStartEvent() {
      state.activity = "writing";
    },
    onToolCallStartEvent() {
      state.activity = "calling_tool";
    },
    onReasoningStartEvent() {
      state.activity = "thinking";
    },
    onReasoningMessageStartEvent() {
      state.activity = "thinking";
    },
    onStateSnapshotEvent() {
      state.activity = "updating_state";
    },
    onStateDeltaEvent() {
      state.activity = "updating_state";
    },
    onRunFinishedEvent(params) {
      state.activity = "idle";
      if (params.outcome === "interrupt") {
        state.status = "awaiting_input";
        state.pendingInterrupts = [...params.interrupts];
      } else if (pendingToolMessages.length === 0) {
        state.status = "success";
      }
    },
    async onRunFinalized() {
      if (pendingToolMessages.length === 0) {
        state.isRunning = false;
        state.activity = "idle";
        await onIdle?.();
        return;
      }
      const drained = pendingToolMessages;
      pendingToolMessages = [];
      await onNeedsReRun(drained);
    },
    onRunFailed({ error }) {
      state.isRunning = false;
      state.activity = "idle";
      if (isAbortError(error)) {
        state.status = "aborted";
        return;
      }
      state.error = error.message;
      state.status = "error";
    },
    onRunErrorEvent({ event }) {
      state.error = event.message;
      state.status = "error";
      state.isRunning = false;
      state.activity = "idle";
    },
  };
}
