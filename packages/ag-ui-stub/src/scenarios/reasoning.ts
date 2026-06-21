import {
  reasoningEnd,
  reasoningMessageContent,
  reasoningMessageEnd,
  reasoningMessageStart,
  reasoningStart,
  textContent,
  textEnd,
  textStart,
} from "../events";
import type { Scenario } from "../types";

const REASONING_ID = "stub-reasoning-1";
const ANSWER_ID = "stub-reasoning-answer-1";
const THOUGHT_CHUNKS = [
  "Let me ",
  "work through ",
  "the request ",
  "step by step",
  "…",
];

/**
 * Streams a visible reasoning summary (REASONING_START → MESSAGE triad →
 * REASONING_END) and then the final assistant answer.
 */
export const reasoning: Scenario = async function* ({ delay }) {
  yield reasoningStart(REASONING_ID);
  yield reasoningMessageStart(REASONING_ID);
  for (const chunk of THOUGHT_CHUNKS) {
    yield reasoningMessageContent(REASONING_ID, chunk);
    await delay();
  }
  yield reasoningMessageEnd(REASONING_ID);
  yield reasoningEnd(REASONING_ID);

  yield textStart(ANSWER_ID);
  yield textContent(ANSWER_ID, "The answer is 42.");
  yield textEnd(ANSWER_ID);
};
