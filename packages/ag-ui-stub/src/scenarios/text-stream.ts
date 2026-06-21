import { textContent, textEnd, textStart } from "../events";
import type { Scenario } from "../types";

const MESSAGE_ID = "stub-text-1";
const CHUNKS = [
  "Hello",
  ", ",
  "this ",
  "is ",
  "a ",
  "stubbed ",
  "AG-UI ",
  "text ",
  "stream",
  ".",
];

/** Streams a single assistant message as a START / CONTENT×n / END triad. */
export const textStream: Scenario = async function* ({ delay }) {
  yield textStart(MESSAGE_ID);
  for (const chunk of CHUNKS) {
    yield textContent(MESSAGE_ID, chunk);
    await delay();
  }
  yield textEnd(MESSAGE_ID);
};
