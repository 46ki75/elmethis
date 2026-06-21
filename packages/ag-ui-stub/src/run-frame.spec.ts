import { describe, expect, it } from "vitest";
import type { BaseEvent } from "@ag-ui/core";

import { runError } from "./events";
import { runFrame } from "./run-frame";
import { makeInput, typesOf } from "./test-support";
import type { Scenario } from "./types";

async function drain(iterable: AsyncIterable<BaseEvent>): Promise<BaseEvent[]> {
  const out: BaseEvent[] = [];
  for await (const event of iterable) out.push(event);
  return out;
}

describe("runFrame", () => {
  it("appends a success RUN_FINISHED when the scenario emits no terminal", async () => {
    const empty: Scenario = async function* () {};
    const events = await drain(runFrame(empty, makeInput()));
    expect(typesOf(events)).toEqual(["RUN_STARTED", "RUN_FINISHED"]);
  });

  it("does not append a second terminal when the scenario ends itself", async () => {
    const erroring: Scenario = async function* () {
      yield runError("boom");
    };
    const events = await drain(runFrame(erroring, makeInput()));
    expect(typesOf(events)).toEqual(["RUN_STARTED", "RUN_ERROR"]);
  });

  it("converts an unexpected throw into a terminal RUN_ERROR", async () => {
    // Throws before yielding by design — that's exactly the case under test.
    // eslint-disable-next-line require-yield
    const throwing: Scenario = async function* () {
      throw new Error("scenario blew up");
    };
    const events = await drain(runFrame(throwing, makeInput()));
    expect(typesOf(events)).toEqual(["RUN_STARTED", "RUN_ERROR"]);
    expect(events.at(-1)).toMatchObject({
      type: "RUN_ERROR",
      message: "scenario blew up",
    });
  });
});
