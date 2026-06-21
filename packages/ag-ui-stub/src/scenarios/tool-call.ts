import {
  toolCallArgs,
  toolCallEnd,
  toolCallResult,
  toolCallStart,
} from "../events";
import type { Scenario } from "../types";

const TOOL_CALL_ID = "stub-tool-1";
const PARENT_MESSAGE_ID = "stub-tool-msg-1";
const RESULT_MESSAGE_ID = "stub-tool-result-1";
const ARG_CHUNKS = ['{"locat', 'ion":"To', 'kyo"}'];

/**
 * A full tool-call round-trip: START → ARGS×n → END → RESULT. Streams the
 * arguments JSON in fragments so consumers exercise incremental arg assembly.
 */
export const toolCall: Scenario = async function* ({ delay }) {
  yield toolCallStart(TOOL_CALL_ID, "get_weather", PARENT_MESSAGE_ID);
  for (const chunk of ARG_CHUNKS) {
    yield toolCallArgs(TOOL_CALL_ID, chunk);
    await delay();
  }
  yield toolCallEnd(TOOL_CALL_ID);
  yield toolCallResult(
    TOOL_CALL_ID,
    JSON.stringify({ tempC: 21, sky: "clear" }),
    RESULT_MESSAGE_ID,
  );
};
