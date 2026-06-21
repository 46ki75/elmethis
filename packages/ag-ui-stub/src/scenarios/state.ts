import {
  stateDelta,
  stateSnapshot,
  textContent,
  textEnd,
  textStart,
} from "../events";
import type { Scenario } from "../types";

const MESSAGE_ID = "stub-state-msg-1";

/**
 * Shared-state flow: a full `STATE_SNAPSHOT` followed by incremental
 * `STATE_DELTA` patches (RFC 6902). Closes with a short text summary so the
 * message list and state panel both update.
 */
export const state: Scenario = async function* ({ delay }) {
  yield stateSnapshot({ counter: 0, items: [] as string[], status: "idle" });
  await delay();

  yield stateDelta([
    { op: "replace", path: "/counter", value: 1 },
    { op: "add", path: "/items/-", value: "first" },
    { op: "replace", path: "/status", value: "running" },
  ]);
  await delay();

  yield stateDelta([
    { op: "replace", path: "/counter", value: 2 },
    { op: "add", path: "/items/-", value: "second" },
    { op: "replace", path: "/status", value: "done" },
  ]);
  await delay();

  yield textStart(MESSAGE_ID);
  yield textContent(MESSAGE_ID, "State now holds 2 items.");
  yield textEnd(MESSAGE_ID);
};
