import {
  EventType,
  type Interrupt,
  type Message,
  type ReasoningEndEvent,
  type ReasoningMessageContentEvent,
  type ReasoningMessageEndEvent,
  type ReasoningMessageStartEvent,
  type ReasoningStartEvent,
  type RunErrorEvent,
  type RunFinishedEvent,
  type RunStartedEvent,
  type StepFinishedEvent,
  type StepStartedEvent,
  type StateDeltaEvent,
  type StateSnapshotEvent,
  type MessagesSnapshotEvent,
  type TextMessageContentEvent,
  type TextMessageEndEvent,
  type TextMessageStartEvent,
  type ToolCallArgsEvent,
  type ToolCallEndEvent,
  type ToolCallResultEvent,
  type ToolCallStartEvent,
} from "@ag-ui/core";

/**
 * Typed event factories. Every helper sets the discriminating `type` field, so
 * scenarios stay terse and can never drift from the `@ag-ui/core` schema.
 */

type Role = TextMessageStartEvent["role"];

// — Run lifecycle —

export const runStarted = (
  threadId: string,
  runId: string,
): RunStartedEvent => ({ type: EventType.RUN_STARTED, threadId, runId });

export const runFinished = (
  threadId: string,
  runId: string,
): RunFinishedEvent => ({ type: EventType.RUN_FINISHED, threadId, runId });

export const runFinishedInterrupt = (
  threadId: string,
  runId: string,
  interrupts: Interrupt[],
): RunFinishedEvent => ({
  type: EventType.RUN_FINISHED,
  threadId,
  runId,
  outcome: { type: "interrupt", interrupts },
});

export const runError = (message: string, code?: string): RunErrorEvent => ({
  type: EventType.RUN_ERROR,
  message,
  ...(code !== undefined ? { code } : {}),
});

// — Steps —

export const stepStarted = (stepName: string): StepStartedEvent => ({
  type: EventType.STEP_STARTED,
  stepName,
});

export const stepFinished = (stepName: string): StepFinishedEvent => ({
  type: EventType.STEP_FINISHED,
  stepName,
});

// — Text messages —

export const textStart = (
  messageId: string,
  role: Role = "assistant",
): TextMessageStartEvent => ({
  type: EventType.TEXT_MESSAGE_START,
  messageId,
  role,
});

export const textContent = (
  messageId: string,
  delta: string,
): TextMessageContentEvent => ({
  type: EventType.TEXT_MESSAGE_CONTENT,
  messageId,
  delta,
});

export const textEnd = (messageId: string): TextMessageEndEvent => ({
  type: EventType.TEXT_MESSAGE_END,
  messageId,
});

// — Tool calls —

export const toolCallStart = (
  toolCallId: string,
  toolCallName: string,
  parentMessageId?: string,
): ToolCallStartEvent => ({
  type: EventType.TOOL_CALL_START,
  toolCallId,
  toolCallName,
  ...(parentMessageId !== undefined ? { parentMessageId } : {}),
});

export const toolCallArgs = (
  toolCallId: string,
  delta: string,
): ToolCallArgsEvent => ({
  type: EventType.TOOL_CALL_ARGS,
  toolCallId,
  delta,
});

export const toolCallEnd = (toolCallId: string): ToolCallEndEvent => ({
  type: EventType.TOOL_CALL_END,
  toolCallId,
});

export const toolCallResult = (
  toolCallId: string,
  content: string,
  messageId: string,
): ToolCallResultEvent => ({
  type: EventType.TOOL_CALL_RESULT,
  messageId,
  toolCallId,
  content,
});

// — State —

export const stateSnapshot = (snapshot: unknown): StateSnapshotEvent => ({
  type: EventType.STATE_SNAPSHOT,
  snapshot,
});

export const stateDelta = (
  delta: StateDeltaEvent["delta"],
): StateDeltaEvent => ({ type: EventType.STATE_DELTA, delta });

export const messagesSnapshot = (
  messages: Message[],
): MessagesSnapshotEvent => ({
  type: EventType.MESSAGES_SNAPSHOT,
  messages,
});

// — Reasoning —

export const reasoningStart = (messageId: string): ReasoningStartEvent => ({
  type: EventType.REASONING_START,
  messageId,
});

export const reasoningMessageStart = (
  messageId: string,
): ReasoningMessageStartEvent => ({
  type: EventType.REASONING_MESSAGE_START,
  messageId,
  role: "reasoning",
});

export const reasoningMessageContent = (
  messageId: string,
  delta: string,
): ReasoningMessageContentEvent => ({
  type: EventType.REASONING_MESSAGE_CONTENT,
  messageId,
  delta,
});

export const reasoningMessageEnd = (
  messageId: string,
): ReasoningMessageEndEvent => ({
  type: EventType.REASONING_MESSAGE_END,
  messageId,
});

export const reasoningEnd = (messageId: string): ReasoningEndEvent => ({
  type: EventType.REASONING_END,
  messageId,
});
