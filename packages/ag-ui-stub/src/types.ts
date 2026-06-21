import type { BaseEvent, RunAgentInput } from "@ag-ui/core";

/**
 * Context handed to every scenario. Scenarios are pure async generators of the
 * *middle* of a run — {@link runFrame} owns the surrounding `RUN_STARTED` /
 * `RUN_FINISHED` lifecycle events.
 */
export interface ScenarioContext {
  /** The decoded `RunAgentInput` from the client request. */
  input: RunAgentInput;
  /**
   * Resolves after the configured `chunkDelayMs`. With the default delay of `0`
   * (used in tests) it resolves immediately, so scenarios can `await delay()`
   * between chunks without slowing down deterministic runs.
   */
  delay: () => Promise<void>;
}

/**
 * A deterministic, LLM-free agent behavior. Yields the events that occur
 * between `RUN_STARTED` and `RUN_FINISHED`. A scenario may emit its own
 * terminal event (`RUN_FINISHED` with an interrupt outcome, or `RUN_ERROR`) to
 * take control of how the run ends; otherwise a success `RUN_FINISHED` is
 * appended automatically.
 */
export type Scenario = (ctx: ScenarioContext) => AsyncIterable<BaseEvent>;
