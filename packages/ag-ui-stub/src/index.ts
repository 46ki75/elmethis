/**
 * @elmethis/ag-ui-stub — a deterministic, LLM-free AG-UI test double.
 *
 * Two layers:
 * - {@link agUiResponse}: a Web-standard `Response` (SSE) generator usable in
 *   any runtime and directly in tests via {@link createStubFetch}.
 * - a Hono server (`src/server.ts`) that mounts the scenarios over HTTP for
 *   Storybook and manual development.
 */

export { agUiResponse, type AgUiResponseOptions } from "./response";
export { createStubFetch, type StubFetchOptions } from "./stub-fetch";
export { runFrame, type RunFrameOptions } from "./run-frame";
export { eventsToSseStream, SSE_CONTENT_TYPE } from "./encode";
export { scenarios, scenarioNames, type ScenarioName } from "./scenarios";
export type { Scenario, ScenarioContext } from "./types";

export * as events from "./events";
