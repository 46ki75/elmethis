/**
 * @elmethis/ag-ui-stub — a deterministic, in-process AG-UI test agent.
 */

export { runFrame, type RunFrameOptions } from "./run-frame";
export { scenarios, scenarioNames, type ScenarioName } from "./scenarios";
export { StubAgent, type StubAgentConfig } from "./stub-agent";
export type { Scenario, ScenarioContext } from "./types";

export * as events from "./events";
