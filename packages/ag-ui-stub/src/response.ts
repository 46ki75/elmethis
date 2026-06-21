import type { RunAgentInput } from "@ag-ui/core";

import { SSE_CONTENT_TYPE, eventsToSseStream } from "./encode";
import { runFrame } from "./run-frame";
import type { Scenario } from "./types";

export interface AgUiResponseOptions {
  /** Delay between scenario chunks, in milliseconds. Defaults to `0`. */
  chunkDelayMs?: number;
  /** Extra response headers merged over the SSE defaults. */
  headers?: RequestInit["headers"];
}

/**
 * Run a {@link Scenario} against a `RunAgentInput` and return a Web-standard
 * `Response` whose body is the AG-UI SSE event stream. Framework-agnostic: hand
 * it back from a Hono/Express/Node handler, or call it directly from a test via
 * {@link createStubFetch} — no server required.
 */
export function agUiResponse(
  scenario: Scenario,
  input: RunAgentInput,
  options: AgUiResponseOptions = {},
): Response {
  const stream = eventsToSseStream(
    runFrame(scenario, input, { chunkDelayMs: options.chunkDelayMs }),
  );

  return new Response(stream, {
    status: 200,
    headers: {
      "content-type": SSE_CONTENT_TYPE,
      "cache-control": "no-cache",
      ...options.headers,
    },
  });
}
