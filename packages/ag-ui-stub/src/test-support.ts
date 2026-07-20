import type { BaseEvent, RunAgentInput } from "@ag-ui/core";

/** Build a minimal valid `RunAgentInput` for tests. */
export function makeInput(
  overrides: Partial<RunAgentInput> = {},
): RunAgentInput {
  return {
    threadId: "stub-thread",
    runId: "stub-run",
    messages: [],
    tools: [],
    context: [],
    forwardedProps: {},
    ...overrides,
  };
}

/** Drain an AG-UI event stream. */
export async function collectEvents(
  iterable: AsyncIterable<BaseEvent>,
): Promise<BaseEvent[]> {
  const events: BaseEvent[] = [];
  for await (const event of iterable) events.push(event);
  return events;
}

/** The `type` discriminator of each event, in order. */
export const typesOf = (events: BaseEvent[]): string[] =>
  events.map((event) => event.type);
