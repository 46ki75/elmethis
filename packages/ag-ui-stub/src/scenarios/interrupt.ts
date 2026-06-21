import {
  runFinishedInterrupt,
  stateSnapshot,
  textContent,
  textEnd,
  textStart,
} from "../events";
import type { Scenario } from "../types";

const INTERRUPT_ID = "stub-confirm-1";

/**
 * Human-in-the-loop confirmation. On the first run it emits a question, a state
 * snapshot (so resume is mode-agnostic), then ends with an `interrupt` outcome.
 * When the client resumes (`RunAgentInput.resume` is non-empty) it continues to
 * a normal success completion.
 */
export const interrupt: Scenario = async function* ({ input }) {
  const resumed = (input.resume?.length ?? 0) > 0;

  if (!resumed) {
    const askId = "stub-interrupt-ask-1";
    yield textStart(askId);
    yield textContent(askId, "I need your confirmation before continuing.");
    yield textEnd(askId);

    // State must be emitted before the interrupt so resume is mode-agnostic.
    yield stateSnapshot({ status: "awaiting_confirmation" });

    yield runFinishedInterrupt(input.threadId, input.runId, [
      {
        id: INTERRUPT_ID,
        reason: "confirmation",
        message: "Proceed with the action?",
      },
    ]);
    return;
  }

  const doneId = "stub-interrupt-done-1";
  yield textStart(doneId);
  yield textContent(doneId, "Thanks — continuing now that you've confirmed.");
  yield textEnd(doneId);
  // runFrame appends the success RUN_FINISHED.
};
