import type { AgentSubscriber, Message } from "@ag-ui/client";
import type { Interrupt } from "@ag-ui/core";
import { v7 } from "uuid";

import { reconcileMessages } from "./reconcile-messages";
import type { ToolRegistry } from "./tool-registry";

/**
 * Coarse run lifecycle, derived from the AG-UI `RUN_*` events:
 *
 * - `idle` — no run in flight (initial, or finished and consumed).
 * - `running` — a run is active (`RUN_STARTED` … before `RUN_FINISHED`).
 * - `success` — the last run finished with `outcome: "success"`.
 * - `awaiting_input` — the last run finished with `outcome: "interrupt"`;
 *   `pendingInterrupts` is populated and a resume run is expected.
 * - `error` — the run failed (`RUN_ERROR`, or the transport threw).
 * - `aborted` — the caller cancelled via `abortRun()`.
 */
export type AgentRunStatus =
  | "idle"
  | "running"
  | "success"
  | "awaiting_input"
  | "error"
  | "aborted";

/**
 * What the agent is doing *right now* within a run, derived from the streaming
 * sub-event triads. Reflects the most recently started sub-activity and resets
 * to `idle` at run boundaries — it is a presentation hint, not a precise
 * state machine (overlapping activities collapse to the latest one).
 */
export type AgentActivity =
  | "idle"
  | "thinking"
  | "writing"
  | "calling_tool"
  | "updating_state";

/**
 * Minimal writable view of the agent state the subscriber mutates. The hook
 * passes its `useStore` proxy; tests pass a plain object.
 */
export interface AgentSubscriberState {
  error: string | null;
  messages: Message[];
  isRunning: boolean;
  /** Coarse run lifecycle — see {@link AgentRunStatus}. */
  status: AgentRunStatus;
  /** Live in-run activity hint — see {@link AgentActivity}. */
  activity: AgentActivity;
  /**
   * Unresolved interrupts from the most recent run, populated when
   * `RUN_FINISHED` arrives with `outcome === "interrupt"`. Cleared when the
   * next run starts (the resume).
   */
  pendingInterrupts: Interrupt[];
}

/** AbortController-driven cancellation surfaces as a DOMException/Error
 *  named "AbortError"; treat it as a user abort, not a failure. */
function isAbortError(error: Error): boolean {
  return error.name === "AbortError";
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
   * Called from `onRunFinalized` once a run has fully settled to idle — i.e.
   * no frontend-tool round-trip is pending and `isRunning` was just set to
   * `false`. Fires on *every* terminal path (success, error, abort), so the
   * handler must inspect `state.status` itself if it only cares about clean
   * completions. Production wires this to drain any user messages queued
   * while the run was in flight (see `useAgent`); the factory stays
   * transport-agnostic and owns no queue.
   */
  onIdle?: () => unknown | Promise<unknown>;
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
  onIdle,
}: CreateAgentSubscriberOptions): AgentSubscriber {
  let pendingToolMessages: Message[] = [];

  return {
    onRunInitialized() {
      state.isRunning = true;
      state.status = "running";
      state.activity = "idle";
      state.error = null;
      // A fresh run resolves any interrupts the previous one was waiting on.
      state.pendingInterrupts = [];
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

    // Live activity hints. Each streaming sub-event triad opens with a START
    // that names the current activity; we set the latest one and let the run
    // boundary reset it to idle. These are presentation-only, so they don't
    // need the precision of the message/lifecycle paths.
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

    // Distinguish the terminal outcome of a run. `outcome: "interrupt"` means
    // the agent paused for human input (HITL) — surface the interrupts so the
    // UI can prompt and resume. A plain success is left as-is when a frontend
    // tool round-trip is queued, since `onRunFinalized` will immediately start
    // a follow-up run and we don't want to flash "success" in between.
    onRunFinishedEvent(params) {
      state.activity = "idle";
      if (params.outcome === "interrupt") {
        state.status = "awaiting_input";
        state.pendingInterrupts = [...params.interrupts];
        return;
      }
      if (pendingToolMessages.length === 0) {
        state.status = "success";
      }
    },

    async onRunFinalized() {
      if (pendingToolMessages.length === 0) {
        state.isRunning = false;
        state.activity = "idle";
        // The run has fully settled — let the caller drain anything queued
        // while it was in flight (it decides whether to act on the status).
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
      // A user-initiated abort is not a failure; keep it out of the error slot.
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
