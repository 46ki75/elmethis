import type { AgentSubscriber, Message } from "@ag-ui/client";
import type { Interrupt, ToolMessage } from "@ag-ui/core";
import { v7 } from "uuid";

import { reconcileMessages } from "./reconcile-messages";
import type { ToolRegistry } from "./tool-registry";

export type AgentRunStatus =
  | "idle"
  | "running"
  | "success"
  | "awaiting_input"
  | "error"
  | "aborted";
export type AgentActivity =
  | "idle"
  | "thinking"
  | "writing"
  | "calling_tool"
  | "updating_state";

export interface AgentSubscriberState {
  error: string | null;
  messages: Message[];
  isRunning: boolean;
  status: AgentRunStatus;
  activity: AgentActivity;
  pendingInterrupts: Interrupt[];
}

export interface CreateAgentSubscriberOptions {
  setState: (update: (draft: AgentSubscriberState) => void) => void;
  getTools: () => ToolRegistry;
  onNeedsReRun: (pendingToolMessages: Message[]) => unknown;
  onIdle?: () => unknown;
}

const isAbortError = (error: Error): boolean => error.name === "AbortError";

export function createAgentSubscriber({
  setState,
  getTools,
  onNeedsReRun,
  onIdle,
}: CreateAgentSubscriberOptions): AgentSubscriber {
  let pendingToolMessages: Message[] = [];
  let toolsForRun: ToolRegistry = {};
  const backendToolCalls = new Set<string>();
  const setActivity = (activity: AgentActivity) => {
    setState((draft) => {
      draft.activity = activity;
    });
  };

  return {
    onRunInitialized({ input }) {
      // Tool definitions are part of RunAgentInput. Registry changes apply to
      // the next run, never to calls already emitted by the current backend.
      const currentTools = getTools();
      toolsForRun = {};
      for (const { name } of input.tools) {
        const tool = currentTools[name];
        if (tool) {
          toolsForRun[name] = tool;
        }
      }
      backendToolCalls.clear();
      setState((draft) => {
        draft.isRunning = true;
        draft.status = "running";
        draft.activity = "idle";
        draft.error = null;
        draft.pendingInterrupts = [];
      });
    },
    onMessagesChanged({ messages }) {
      setState((draft) => reconcileMessages(draft.messages, messages));
    },
    async onToolCallEndEvent({ event, toolCallName, toolCallArgs }) {
      if (backendToolCalls.delete(event.toolCallId)) {
        return;
      }
      const tool = toolsForRun[toolCallName];
      if (!tool) {
        return;
      }
      const toolMessage: ToolMessage = {
        id: v7(),
        role: "tool",
        content: JSON.stringify(await tool.execute(toolCallArgs)),
        toolCallId: event.toolCallId,
      };
      pendingToolMessages.push(toolMessage);
    },
    onTextMessageStartEvent() {
      setActivity("writing");
    },
    onToolCallStartEvent({ event }) {
      if (event.metadata?.elmethisCodexTool === "backend") {
        backendToolCalls.add(event.toolCallId);
      }
      setActivity("calling_tool");
    },
    onReasoningStartEvent() {
      setActivity("thinking");
    },
    onReasoningMessageStartEvent() {
      setActivity("thinking");
    },
    onStateSnapshotEvent() {
      setActivity("updating_state");
    },
    onStateDeltaEvent() {
      setActivity("updating_state");
    },
    onRunFinishedEvent(params) {
      setState((draft) => {
        draft.activity = "idle";
        if (params.outcome === "interrupt") {
          draft.status = "awaiting_input";
          draft.pendingInterrupts = [...params.interrupts];
        } else if (pendingToolMessages.length === 0) {
          draft.status = "success";
        }
      });
    },
    async onRunFinalized() {
      if (pendingToolMessages.length === 0) {
        setState((draft) => {
          draft.isRunning = false;
          draft.activity = "idle";
        });
        await onIdle?.();
        return;
      }
      const drained = pendingToolMessages;
      pendingToolMessages = [];
      await onNeedsReRun(drained);
    },
    onRunFailed({ error }) {
      setState((draft) => {
        draft.isRunning = false;
        draft.activity = "idle";
        if (isAbortError(error)) {
          draft.status = "aborted";
          return;
        }
        draft.error = error.message;
        draft.status = "error";
      });
    },
    onRunErrorEvent({ event }) {
      setState((draft) => {
        draft.error = event.message;
        draft.status = "error";
        draft.isRunning = false;
        draft.activity = "idle";
      });
    },
  };
}
