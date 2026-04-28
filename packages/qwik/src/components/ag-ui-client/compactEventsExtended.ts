import { BaseEvent, compactEvents } from "@ag-ui/client";
import { EventType } from "@ag-ui/core";

type ReasoningContentEvent = BaseEvent & { messageId: string; delta: string };
type ReasoningBoundaryEvent = BaseEvent & { messageId: string };

/**
 * Extends compactEvents to also compact REASONING_MESSAGE_CONTENT sequences.
 *
 * Complete groups (START + CONTENT* + END with the same messageId) are collapsed
 * to a single merged CONTENT event. Interleaved non-reasoning events are moved
 * after the END event, matching the same semantics as compactEvents for text
 * messages and tool calls.
 *
 * Incomplete groups (streaming, no END seen yet) are left untouched so the UI
 * can still render partial content.
 */
export function compactEventsExtended(events: BaseEvent[]): BaseEvent[] {
  return compactEvents(compactReasoningMessageEvents(events));
}

function compactReasoningMessageEvents(events: BaseEvent[]): BaseEvent[] {
  const completeIds = findCompleteReasoningGroups(events);
  if (completeIds.size === 0) return events;

  const result: BaseEvent[] = [];
  const activeGroups = new Map<
    string,
    {
      delta: string;
      template: ReasoningContentEvent | null;
      interleaved: BaseEvent[];
    }
  >();

  for (const event of events) {
    if (event.type === EventType.REASONING_MESSAGE_START) {
      const { messageId } = event as ReasoningBoundaryEvent;
      if (completeIds.has(messageId)) {
        activeGroups.set(messageId, {
          delta: "",
          template: null,
          interleaved: [],
        });
      }
      result.push(event);
    } else if (event.type === EventType.REASONING_MESSAGE_CONTENT) {
      const ce = event as ReasoningContentEvent;
      const group = activeGroups.get(ce.messageId);
      if (group) {
        group.delta += ce.delta;
        group.template ??= ce;
      } else {
        result.push(event);
      }
    } else if (event.type === EventType.REASONING_MESSAGE_END) {
      const { messageId } = event as ReasoningBoundaryEvent;
      const group = activeGroups.get(messageId);
      if (group) {
        if (group.delta) {
          result.push({
            ...(group.template as object),
            type: EventType.REASONING_MESSAGE_CONTENT,
            messageId,
            delta: group.delta,
          } as BaseEvent);
        }
        result.push(event);
        result.push(...group.interleaved);
        activeGroups.delete(messageId);
      } else {
        result.push(event);
      }
    } else {
      const openIds = [...activeGroups.keys()];
      if (openIds.length > 0) {
        activeGroups.get(openIds[openIds.length - 1])!.interleaved.push(event);
      } else {
        result.push(event);
      }
    }
  }

  return result;
}

function findCompleteReasoningGroups(events: BaseEvent[]): Set<string> {
  const started = new Set<string>();
  const complete = new Set<string>();
  for (const event of events) {
    const e = event as ReasoningBoundaryEvent;
    if (event.type === EventType.REASONING_MESSAGE_START && e.messageId) {
      started.add(e.messageId);
    } else if (
      event.type === EventType.REASONING_MESSAGE_END &&
      e.messageId &&
      started.has(e.messageId)
    ) {
      complete.add(e.messageId);
    }
  }
  return complete;
}
