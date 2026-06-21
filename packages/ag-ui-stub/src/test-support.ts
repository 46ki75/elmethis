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

/** Drain an AG-UI SSE `Response` into its decoded events. */
export async function collectEvents(response: Response): Promise<BaseEvent[]> {
  const text = await response.text();
  return text
    .split("\n\n")
    .map((block) => block.trim())
    .filter((block) => block.startsWith("data:"))
    .map(
      (block) =>
        JSON.parse(block.slice(block.indexOf("data:") + 5).trim()) as BaseEvent,
    );
}

/** The `type` discriminator of each event, in order. */
export const typesOf = (events: BaseEvent[]): string[] =>
  events.map((event) => event.type);
