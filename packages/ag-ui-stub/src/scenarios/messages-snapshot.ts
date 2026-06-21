import type { Message } from "@ag-ui/core";

import { messagesSnapshot } from "../events";
import type { Scenario } from "../types";

const MESSAGES: Message[] = [
  { id: "stub-msg-user-1", role: "user", content: "What can you do?" },
  {
    id: "stub-msg-assistant-1",
    role: "assistant",
    content: "I'm a stubbed AG-UI agent for deterministic component tests.",
  },
];

/**
 * Replaces the full message history in one shot via `MESSAGES_SNAPSHOT`.
 *
 * Note: AG-UI has no *output* multimodal events — multimodality is an input
 * concern carried by `RunAgentInput` and handled in the client's input
 * components. This scenario covers the analogous server-emitted path (history
 * replacement) that the message renderer needs to exercise.
 */
export const messagesSnapshotScenario: Scenario = async function* () {
  yield messagesSnapshot(MESSAGES);
};
