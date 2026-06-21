import { runError, textContent, textEnd, textStart } from "../events";
import type { Scenario } from "../types";

const MESSAGE_ID = "stub-error-1";

/** Streams a little text, then ends the run with a `RUN_ERROR`. */
export const error: Scenario = async function* () {
  yield textStart(MESSAGE_ID);
  yield textContent(MESSAGE_ID, "Starting a task that will fail…");
  yield textEnd(MESSAGE_ID);
  yield runError(
    "Simulated failure from @elmethis/ag-ui-stub",
    "STUB_SIMULATED_ERROR",
  );
};
