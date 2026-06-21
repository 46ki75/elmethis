import type { Scenario } from "../types";
import { error } from "./error";
import { full } from "./full";
import { interrupt } from "./interrupt";
import { longStream } from "./long-stream";
import { messagesSnapshotScenario } from "./messages-snapshot";
import { reasoning } from "./reasoning";
import { state } from "./state";
import { textStream } from "./text-stream";
import { toolCall } from "./tool-call";

/**
 * The catalog of deterministic, LLM-free scenarios. Each one maps to a branch
 * of the `@elmethis` ag-ui-client renderers — together they form the component
 * test matrix.
 */
export const scenarios = {
  full,
  "text-stream": textStream,
  "tool-call": toolCall,
  state,
  reasoning,
  interrupt,
  "messages-snapshot": messagesSnapshotScenario,
  error,
  "long-stream": longStream,
} satisfies Record<string, Scenario>;

export type ScenarioName = keyof typeof scenarios;

export const scenarioNames = Object.keys(scenarios) as ScenarioName[];

export {
  error,
  full,
  interrupt,
  longStream,
  messagesSnapshotScenario,
  reasoning,
  state,
  textStream,
  toolCall,
};
