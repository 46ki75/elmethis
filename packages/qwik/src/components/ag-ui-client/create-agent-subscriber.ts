import type {
  AgentSubscriber,
  BaseEvent,
  Message,
} from "@ag-ui/client";
import { v7 } from "uuid";

import { compactEventsExtended } from "./compactEventsExtended";
import type { ToolRegistry } from "./tool-registry";

/**
 * Minimal writable view of the agent state the subscriber mutates. The hook
 * passes its `useStore` proxy; tests pass a plain object.
 */
export interface AgentSubscriberState {
  error: string | null;
  messages: Message[];
  events: BaseEvent[];
  isRunning: boolean;
}

export interface CreateAgentSubscriberOptions {
  state: AgentSubscriberState;
  /**
   * Lazy accessor for the current tool registry. Implemented as a getter so
   * that tools registered *after* the subscriber is constructed are still
   * picked up at event time.
   */
  getTools: () => ToolRegistry;
  /**
   * Called from `onRunFinalized` when tool messages were queued during the
   * run. Receives the drained queue. Production wires this to push the
   * messages into `httpAgent.messages` and call `runAgent` again; the
   * factory itself stays transport-agnostic.
   */
  onNeedsReRun: (pendingToolMessages: Message[]) => unknown | Promise<unknown>;
}

/**
 * Build the AG-UI `AgentSubscriber` that owns all event-to-state mapping
 * for `useAgent`. The factory keeps `pendingToolMessages` as a private
 * closure so callers can't accidentally clear it mid-run.
 */
export function createAgentSubscriber({
  state,
  getTools,
  onNeedsReRun,
}: CreateAgentSubscriberOptions): AgentSubscriber {
  let pendingToolMessages: Message[] = [];

  return {
    onRunInitialized() {
      state.isRunning = true;
    },

    onEvent({ messages: newMessages, event }) {
      if (state.messages.length < newMessages.length) {
        state.messages.push(
          ...newMessages.slice(state.messages.length),
        );
      }
      state.events = compactEventsExtended([...state.events, event]);
    },

    onTextMessageContentEvent({ event }) {
      const msg = state.messages.findLast((m) => m.role === "assistant");
      if (msg) msg.content = (msg.content ?? "") + event.delta;
    },

    onReasoningMessageContentEvent({ event }) {
      const msg = state.messages.findLast((m) => m.role === "reasoning");
      if (msg) msg.content = (msg.content ?? "") + event.delta;
    },

    onActivityDeltaEvent({ activityMessage }) {
      const msg = state.messages.findLast((m) => m.role === "activity");
      if (msg && activityMessage) msg.content = activityMessage.content;
    },

    onToolCallArgsEvent({ event }) {
      const msg = state.messages.findLast((m) => m.role === "assistant");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toolCall = (msg as any)?.toolCalls?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tc: any) => tc.id === event.toolCallId,
      );
      if (toolCall) toolCall.function.arguments += event.delta;
    },

    async onToolCallEndEvent({ event, toolCallName }) {
      const registry = getTools();
      const tool = registry[toolCallName];
      if (!tool) return;
      const msg = state.messages.findLast((m) => m.role === "assistant");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toolCall = (msg as any)?.toolCalls?.find(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (tc: any) => tc.id === event.toolCallId,
      );
      const args = toolCall?.function.arguments
        ? JSON.parse(toolCall.function.arguments)
        : {};
      pendingToolMessages.push({
        id: v7(),
        role: "tool",
        content: JSON.stringify(await tool.execute(args)),
        toolCallId: event.toolCallId,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any);
    },

    async onRunFinalized() {
      if (pendingToolMessages.length === 0) {
        state.isRunning = false;
        return;
      }
      const drained = pendingToolMessages;
      pendingToolMessages = [];
      await onNeedsReRun(drained);
    },

    onRunFailed({ error }) {
      state.error = error.message;
    },

    onRunErrorEvent({ event }) {
      state.error = event.message;
    },
  };
}
