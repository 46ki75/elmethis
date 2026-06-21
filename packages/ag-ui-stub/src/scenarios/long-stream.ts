import { textContent, textEnd, textStart } from "../events";
import type { Scenario } from "../types";

const MESSAGE_ID = "stub-long-1";
const TOKEN_COUNT = 200;

/**
 * Emits many small content chunks to exercise backpressure and long-running
 * streaming UI (typing indicators, `isRunning`). Deterministic — tokens are a
 * simple counter, not random.
 */
export const longStream: Scenario = async function* ({ delay }) {
  yield textStart(MESSAGE_ID);
  for (let i = 0; i < TOKEN_COUNT; i += 1) {
    yield textContent(MESSAGE_ID, `token-${i} `);
    await delay();
  }
  yield textEnd(MESSAGE_ID);
};
