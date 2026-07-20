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
const WEATHER = {
  tempC: 21,
  feelsLikeC: 20,
  sky: "clear",
  humidityPercent: 54,
  windKph: 11,
  precipitationChancePercent: 10,
};

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
  for (const chunk of [
    "The user needs a useful weather summary. ",
    "I'll fetch the current conditions for Tokyo, ",
    "check the temperature, humidity, wind, and chance of rain, ",
    "then present the result in a concise, readable format.",
  ]) {
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
    JSON.stringify({ location: "Tokyo", ...WEATHER }),
    TOOL_RESULT_ID,
  );
  yield stepFinished("act");

  // 3. Update shared state
  yield stateSnapshot({ location: "Tokyo", weather: null, status: "fetching" });
  await delay();
  yield stateDelta([
    { op: "replace", path: "/weather", value: WEATHER },
    { op: "replace", path: "/status", value: "ready" },
  ]);
  await delay();

  // 4. Answer
  yield textStart(ANSWER_ID);
  for (const chunk of [
    "## Tokyo weather\n\n",
    "Conditions are **clear** with a temperature of **21°C**, feeling like **20°C**. ",
    "Humidity is **54%**, with a light breeze at **11 km/h**.\n\n",
    "### At a glance\n\n",
    "- Rain chance: **10%**\n",
    "- Outdoor conditions: **Comfortable**\n",
    "- Data source: `get_weather`\n\n",
    "It should be a pleasant day for walking around Tokyo. A light layer may be useful later in the evening, but you probably will not need an umbrella.",
  ]) {
    yield textContent(ANSWER_ID, chunk);
    await delay();
  }
  yield textEnd(ANSWER_ID);
};
