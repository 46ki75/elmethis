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

const ANSWER_ID = "stub-full-answer-1";
const LOCATION = {
  name: "Tokyo",
  country: "Japan",
  latitude: 35.6762,
  longitude: 139.6503,
  timezone: "Asia/Tokyo",
};
const WEATHER = {
  tempC: 21,
  feelsLikeC: 20,
  sky: "clear",
  humidityPercent: 54,
  windKph: 11,
  precipitationChancePercent: 10,
};
const FORECAST = [
  { day: "Today", highC: 23, lowC: 16, sky: "clear", rainChancePercent: 10 },
  {
    day: "Tomorrow",
    highC: 22,
    lowC: 17,
    sky: "partly cloudy",
    rainChancePercent: 20,
  },
  {
    day: "Wednesday",
    highC: 19,
    lowC: 15,
    sky: "light rain",
    rainChancePercent: 65,
  },
];

/**
 * A complete, realistic agent run that chains the building blocks into one
 * stream: reason → act (tool call) → update shared state → answer. Phases are
 * delimited with `STEP_STARTED` / `STEP_FINISHED` so the renderer's step
 * handling is exercised too. This is the closest single endpoint to what a real
 * agent backend produces.
 */
export const full: Scenario = async function* ({ delay }) {
  yield stateSnapshot({
    query: "weather in Tokyo",
    location: null,
    currentWeather: null,
    forecast: null,
    status: "planning",
  });

  // 1. Plan the work.
  yield stepStarted("plan");
  yield reasoningStart("stub-full-reasoning-plan");
  yield reasoningMessageStart("stub-full-reasoning-plan");
  for (const chunk of [
    "The user wants a practical weather briefing for Tokyo. ",
    "I should first resolve the place to avoid using the wrong Tokyo, ",
    "then retrieve current conditions and a short forecast. ",
    "With both results I can recommend what to wear and whether to carry an umbrella.",
  ]) {
    yield reasoningMessageContent("stub-full-reasoning-plan", chunk);
    await delay();
  }
  yield reasoningMessageEnd("stub-full-reasoning-plan");
  yield reasoningEnd("stub-full-reasoning-plan");
  yield stepFinished("plan");

  // 2. Resolve the user's location to coordinates.
  yield stepStarted("resolve-location");
  yield toolCallStart(
    "stub-full-tool-location",
    "resolve_location",
    "stub-full-tool-location-message",
  );
  for (const chunk of ['{"query":', '"Tokyo, Japan"', "}"]) {
    yield toolCallArgs("stub-full-tool-location", chunk);
    await delay();
  }
  yield toolCallEnd("stub-full-tool-location");
  yield toolCallResult(
    "stub-full-tool-location",
    JSON.stringify(LOCATION),
    "stub-full-tool-location-result",
  );
  await delay();
  yield stateDelta([
    { op: "replace", path: "/location", value: LOCATION },
    { op: "replace", path: "/status", value: "fetching-current-weather" },
  ]);
  yield stepFinished("resolve-location");

  // 3. Inspect the location result, then fetch current conditions.
  yield stepStarted("current-weather");
  yield reasoningStart("stub-full-reasoning-current");
  yield reasoningMessageStart("stub-full-reasoning-current");
  for (const chunk of [
    "The location result confirms Tokyo, Japan in the Asia/Tokyo timezone. ",
    "Now I can use its coordinates for precise current conditions rather than relying on a city-name match.",
  ]) {
    yield reasoningMessageContent("stub-full-reasoning-current", chunk);
    await delay();
  }
  yield reasoningMessageEnd("stub-full-reasoning-current");
  yield reasoningEnd("stub-full-reasoning-current");

  yield toolCallStart(
    "stub-full-tool-weather",
    "get_weather",
    "stub-full-tool-weather-message",
  );
  for (const chunk of [
    '{"latitude":35.6762,',
    '"longitude":139.6503,',
    '"unit":"celsius"}',
  ]) {
    yield toolCallArgs("stub-full-tool-weather", chunk);
    await delay();
  }
  yield toolCallEnd("stub-full-tool-weather");
  yield toolCallResult(
    "stub-full-tool-weather",
    JSON.stringify(WEATHER),
    "stub-full-tool-weather-result",
  );
  await delay();
  yield stateDelta([
    { op: "replace", path: "/currentWeather", value: WEATHER },
    { op: "replace", path: "/status", value: "fetching-forecast" },
  ]);
  yield stepFinished("current-weather");

  // 4. Assess the current conditions, then check the near-term forecast.
  yield stepStarted("forecast");
  yield reasoningStart("stub-full-reasoning-forecast");
  yield reasoningMessageStart("stub-full-reasoning-forecast");
  for (const chunk of [
    "Current conditions look comfortable: 21°C, low rain risk, and only a light breeze. ",
    "That answers what it is like now, but a forecast will reveal whether plans later in the week need rain protection.",
  ]) {
    yield reasoningMessageContent("stub-full-reasoning-forecast", chunk);
    await delay();
  }
  yield reasoningMessageEnd("stub-full-reasoning-forecast");
  yield reasoningEnd("stub-full-reasoning-forecast");

  yield toolCallStart(
    "stub-full-tool-forecast",
    "get_forecast",
    "stub-full-tool-forecast-message",
  );
  for (const chunk of [
    '{"latitude":35.6762,',
    '"longitude":139.6503,',
    '"days":3}',
  ]) {
    yield toolCallArgs("stub-full-tool-forecast", chunk);
    await delay();
  }
  yield toolCallEnd("stub-full-tool-forecast");
  yield toolCallResult(
    "stub-full-tool-forecast",
    JSON.stringify(FORECAST),
    "stub-full-tool-forecast-result",
  );
  await delay();
  yield stateDelta([
    { op: "replace", path: "/forecast", value: FORECAST },
    { op: "replace", path: "/status", value: "composing-answer" },
  ]);
  yield stepFinished("forecast");

  // 5. Reconcile all tool results and compose the final answer.
  yield stepStarted("compose-answer");
  yield reasoningStart("stub-full-reasoning-compose");
  yield reasoningMessageStart("stub-full-reasoning-compose");
  for (const chunk of [
    "The current weather and forecast agree that today should stay mild and mostly dry. ",
    "Tomorrow remains similar, while Wednesday has a meaningful rain signal and cooler temperatures. ",
    "I'll lead with today's conditions, include the three-day outlook, and make the timing of the umbrella advice explicit.",
  ]) {
    yield reasoningMessageContent("stub-full-reasoning-compose", chunk);
    await delay();
  }
  yield reasoningMessageEnd("stub-full-reasoning-compose");
  yield reasoningEnd("stub-full-reasoning-compose");

  yield textStart(ANSWER_ID);
  for (const chunk of [
    "## Tokyo weather\n\n",
    "It is **clear and 21°C** in Tokyo, feeling like **20°C**. ",
    "Humidity is **54%**, winds are light at **11 km/h**, and the chance of rain is only **10%**.\n\n",
    "### Three-day outlook\n\n",
    "| Day | Conditions | High / Low | Rain |\n",
    "| --- | --- | --- | --- |\n",
    "| Today | Clear | 23°C / 16°C | 10% |\n",
    "| Tomorrow | Partly cloudy | 22°C / 17°C | 20% |\n",
    "| Wednesday | Light rain | 19°C / 15°C | 65% |\n\n",
    "### Recommendation\n\n",
    "Today should be comfortable for walking around the city. Wear a light layer for the cooler evening; you can probably leave the umbrella behind today, but bring one on Wednesday.\n\n",
    "_Location resolved to Tokyo, Japan (`35.6762, 139.6503`), using `get_weather` and `get_forecast`._",
  ]) {
    yield textContent(ANSWER_ID, chunk);
    await delay();
  }
  yield textEnd(ANSWER_ID);
  yield stateDelta([{ op: "replace", path: "/status", value: "complete" }]);
  yield stepFinished("compose-answer");
};
