import { EventType, type BaseEvent, type RunAgentInput } from "@ag-ui/core";

import { makeDelay } from "./delay";
import { runError, runFinished, runStarted } from "./events";
import type { Scenario } from "./types";

export interface RunFrameOptions {
  /** Delay between scenario chunks, in milliseconds. Defaults to `0`. */
  chunkDelayMs?: number;
}

const isTerminal = (event: BaseEvent): boolean =>
  event.type === EventType.RUN_FINISHED || event.type === EventType.RUN_ERROR;

/**
 * Wrap a {@link Scenario} in a protocol-faithful run:
 *
 * - emits `RUN_STARTED` first, echoing the request's `threadId` / `runId`;
 * - relays the scenario's events;
 * - appends a success `RUN_FINISHED` only if the scenario didn't already emit
 *   its own terminal event (interrupt outcome or `RUN_ERROR`);
 * - converts an unexpected scenario throw into a `RUN_ERROR` so the stream
 *   always ends on a valid terminal event.
 */
export async function* runFrame(
  scenario: Scenario,
  input: RunAgentInput,
  options: RunFrameOptions = {},
): AsyncIterable<BaseEvent> {
  yield runStarted(input.threadId, input.runId);

  const delay = makeDelay(options.chunkDelayMs ?? 0);
  let terminated = false;

  try {
    for await (const event of scenario({ input, delay })) {
      if (isTerminal(event)) terminated = true;
      yield event;
    }
  } catch (error) {
    yield runError(error instanceof Error ? error.message : String(error));
    return;
  }

  if (!terminated) yield runFinished(input.threadId, input.runId);
}
