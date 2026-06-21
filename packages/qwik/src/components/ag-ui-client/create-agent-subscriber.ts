import type { AgentSubscriber, BaseEvent, Message } from "@ag-ui/client";
import { v7 } from "uuid";

import { compactEventsExtended } from "./compactEventsExtended";
import { reconcileMessages } from "./reconcile-messages";
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
  /**
   * Maintain the raw protocol-event timeline in `state.events` (consumed by
   * `ElmAgUiEventRenderer`). Off by default: the chat UI renders from
   * `state.messages`, so collecting events is a separate, opt-in
   * observability concern. See the note on `onEvent` below.
   */
  collectEvents?: boolean;
}

/**
 * Build the AG-UI `AgentSubscriber` that drives `useAgent`'s reactive state.
 *
 * The `@ag-ui/client` agent already runs the full event-to-message reducer
 * internally: its RxJS pipeline rebuilds the complete message list (deltas
 * concatenated, tool-call args assembled, snapshots/deltas applied) and hands
 * it to `onMessagesChanged` on *every* change — including each streaming
 * delta. So this subscriber is a **view, not a reducer**: it mirrors the
 * reconstructed messages verbatim instead of re-deriving them. The only
 * stateful concern it owns is executing frontend tools and queueing their
 * results for a follow-up run (`pendingToolMessages` is kept as a private
 * closure so callers can't clear it mid-run).
 */
export function createAgentSubscriber({
  state,
  getTools,
  onNeedsReRun,
  collectEvents = false,
}: CreateAgentSubscriberOptions): AgentSubscriber {
  let pendingToolMessages: Message[] = [];

  // Plain, non-reactive accumulator that is the source of truth for the
  // opt-in event timeline. We must NOT read `state.events` back into
  // `compactEventsExtended`: in production `state` is a Qwik `useStore`
  // proxy, so its array elements come back as reactive proxies. For
  // STATE_SNAPSHOT/STATE_DELTA events `compactEvents` deep-clones the payload
  // via `structuredClone`, which throws `DataCloneError` on a Qwik proxy
  // (the proxy's hidden container references aren't cloneable). Keeping the
  // accumulator here guarantees the cloner only ever sees plain objects.
  let events: BaseEvent[] = collectEvents ? [...state.events] : [];

  return {
    onRunInitialized() {
      state.isRunning = true;
      state.error = null;
    },

    // Single source of truth for the message list. The SDK fires this with a
    // freshly-rebuilt array after every mutation (including each streaming
    // delta), so there are no per-delta handlers, no `findLast`, and no
    // tail-append heuristics. We reconcile in place rather than reassigning:
    // swapping in the SDK's new object identities each delta would defeat the
    // renderer's fine-grained reactivity (see reconcile-messages.ts).
    onMessagesChanged({ messages }) {
      reconcileMessages(state.messages, messages);
    },

    // Opt-in raw-event timeline, fully isolated from message handling.
    onEvent({ event }) {
      if (!collectEvents) return;
      events = compactEventsExtended([...events, event]);
      state.events = events;
    },

    // Frontend-executed tool. The SDK has already assembled and JSON-parsed
    // the arguments by the time this fires, so read `toolCallArgs` directly
    // rather than re-parsing the message copy.
    async onToolCallEndEvent({ event, toolCallName, toolCallArgs }) {
      const tool = getTools()[toolCallName];
      if (!tool) return;
      pendingToolMessages.push({
        id: v7(),
        role: "tool",
        content: JSON.stringify(await tool.execute(toolCallArgs)),
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
      state.isRunning = false;
    },

    onRunErrorEvent({ event }) {
      state.error = event.message;
      state.isRunning = false;
    },
  };
}
