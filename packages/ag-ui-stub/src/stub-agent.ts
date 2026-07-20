import {
  AbstractAgent,
  type AgentConfig,
  type BaseEvent,
  type RunAgentInput,
} from "@ag-ui/client";
import { from, Observable } from "rxjs";

import { runFrame, type RunFrameOptions } from "./run-frame";
import { scenarios, type ScenarioName } from "./scenarios";
import type { Scenario } from "./types";

export interface StubAgentConfig extends AgentConfig, RunFrameOptions {
  scenario: Scenario | ScenarioName;
}

/** An in-process AG-UI agent backed by a deterministic scenario. */
export class StubAgent extends AbstractAgent {
  readonly scenario: Scenario;
  readonly chunkDelayMs: number;
  private readonly activeRuns = new Set<AbortController>();

  constructor({ scenario, chunkDelayMs = 0, ...config }: StubAgentConfig) {
    super(config);
    this.scenario =
      typeof scenario === "string" ? scenarios[scenario] : scenario;
    this.chunkDelayMs = chunkDelayMs;
  }

  run(input: RunAgentInput): Observable<BaseEvent> {
    return new Observable((subscriber) => {
      const controller = new AbortController();
      this.activeRuns.add(controller);
      const subscription = from(
        runFrame(this.scenario, input, {
          chunkDelayMs: this.chunkDelayMs,
          signal: controller.signal,
        }),
      ).subscribe(subscriber);

      return () => {
        controller.abort();
        this.activeRuns.delete(controller);
        subscription.unsubscribe();
      };
    });
  }

  override abortRun(): void {
    super.abortRun();
    for (const controller of this.activeRuns) controller.abort();
    this.isRunning = false;
  }
}
