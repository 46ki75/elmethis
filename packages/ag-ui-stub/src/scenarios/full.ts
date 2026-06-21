import {
  reasoningEnd,
  reasoningMessageContent,
  reasoningMessageEnd,
  reasoningMessageStart,
  reasoningStart,
  stateDelta,
  stateSnapshot,
  stepFinished,
  stepStarted,
  textContent,
  textEnd,
  textStart,
  toolCallArgs,
  toolCallEnd,
  toolCallResult,
  toolCallStart,
} from "../events";
import type { Scenario } from "../types";

const REASONING_ID = "stub-full-reasoning-1";
const TOOL_CALL_ID = "stub-full-tool-1";
const TOOL_PARENT_ID = "stub-full-tool-msg-1";
const TOOL_RESULT_ID = "stub-full-tool-result-1";
const ANSWER_ID = "stub-full-answer-1";

/**
 * A complete, realistic agent run that chains the building blocks into one
 * stream: reason → act (tool call) → update shared state → answer. Phases are
 * delimited with `STEP_STARTED` / `STEP_FINISHED` so the renderer's step
 * handling is exercised too. This is the closest single endpoint to what a real
 * agent backend produces.
 */
export const full: Scenario = async function* ({ delay }) {
  // 1. Reason
  yield stepStarted("reason");
  yield reasoningStart(REASONING_ID);
  yield reasoningMessageStart(REASONING_ID);
  for (const chunk of ["I should ", "check the ", "weather first", "…"]) {
    yield reasoningMessageContent(REASONING_ID, chunk);
    await delay();
  }
  yield reasoningMessageEnd(REASONING_ID);
  yield reasoningEnd(REASONING_ID);
  yield stepFinished("reason");

  // 2. Act — call a tool and receive its result
  yield stepStarted("act");
  yield toolCallStart(TOOL_CALL_ID, "get_weather", TOOL_PARENT_ID);
  for (const chunk of ['{"locat', 'ion":"To', 'kyo"}']) {
    yield toolCallArgs(TOOL_CALL_ID, chunk);
    await delay();
  }
  yield toolCallEnd(TOOL_CALL_ID);
  yield toolCallResult(
    TOOL_CALL_ID,
    JSON.stringify({ tempC: 21, sky: "clear" }),
    TOOL_RESULT_ID,
  );
  yield stepFinished("act");

  // 3. Update shared state
  yield stateSnapshot({ location: "Tokyo", weather: null, status: "fetching" });
  await delay();
  yield stateDelta([
    { op: "replace", path: "/weather", value: { tempC: 21, sky: "clear" } },
    { op: "replace", path: "/status", value: "ready" },
  ]);
  await delay();

  // 4. Answer
  yield textStart(ANSWER_ID);
  for (const chunk of ["It's ", "21°C ", "and ", "clear ", "in Tokyo", "."]) {
    yield textContent(ANSWER_ID, chunk);
    await delay();
  }
  yield textEnd(ANSWER_ID);
};
