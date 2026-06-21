import type { RunAgentInput } from "@ag-ui/core";

import { agUiResponse, type AgUiResponseOptions } from "./response";
import { scenarios, type ScenarioName } from "./scenarios";
import type { Scenario } from "./types";

export interface StubFetchOptions extends AgUiResponseOptions {
  /**
   * Resolve a scenario from the request URL and decoded input. Return
   * `undefined` to fall through to URL-segment matching, then `fallback`.
   */
  resolveScenario?: (url: URL, input: RunAgentInput) => Scenario | undefined;
  /** Scenario used when resolution fails. Defaults to `"text-stream"`. */
  fallback?: ScenarioName;
}

/**
 * Build a `fetch`-compatible function backed by the stub scenarios — no server,
 * no ports. Pass it to `new HttpAgent({ url, fetch: createStubFetch() })` (the
 * SDK injects it verbatim) or to `vi.stubGlobal("fetch", …)` for fully
 * deterministic, CI-safe component tests.
 *
 * The scenario is taken from the URL path: `.../agent/<scenario>/run`, falling
 * back to the last path segment, then to {@link StubFetchOptions.fallback}.
 */
export function createStubFetch(options: StubFetchOptions = {}): typeof fetch {
  const {
    resolveScenario,
    fallback = "text-stream",
    ...responseOptions
  } = options;

  const stubFetch = async (
    input: Parameters<typeof fetch>[0],
    init?: Parameters<typeof fetch>[1],
  ): Promise<Response> => {
    const request = new Request(input, init);
    const url = new URL(request.url);
    const agentInput = (await request.json()) as RunAgentInput;

    const scenario =
      resolveScenario?.(url, agentInput) ??
      scenarioFromUrl(url) ??
      scenarios[fallback];

    return agUiResponse(scenario, agentInput, responseOptions);
  };

  return stubFetch as typeof fetch;
}

function scenarioFromUrl(url: URL): Scenario | undefined {
  const segments = url.pathname.split("/").filter(Boolean);
  const runIndex = segments.lastIndexOf("run");
  const name =
    runIndex > 0 ? segments[runIndex - 1] : segments[segments.length - 1];
  return name !== undefined && name in scenarios
    ? scenarios[name as ScenarioName]
    : undefined;
}
