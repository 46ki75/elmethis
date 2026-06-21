import { describe, expect, it } from "vitest";

import { agUiResponse } from "./response";
import { scenarios } from "./scenarios";
import { collectEvents, makeInput, typesOf } from "./test-support";

describe("agUiResponse", () => {
  it("serves a Server-Sent Events response", () => {
    const response = agUiResponse(scenarios["text-stream"], makeInput());
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/event-stream");
  });

  it("wraps the scenario with RUN_STARTED / RUN_FINISHED echoing the ids", async () => {
    const response = agUiResponse(
      scenarios["text-stream"],
      makeInput({ threadId: "T", runId: "R" }),
    );
    const events = await collectEvents(response);

    expect(events[0]).toMatchObject({
      type: "RUN_STARTED",
      threadId: "T",
      runId: "R",
    });
    expect(events.at(-1)).toMatchObject({
      type: "RUN_FINISHED",
      threadId: "T",
      runId: "R",
    });
  });

  it("streams a complete text triad between the lifecycle events", async () => {
    const events = await collectEvents(
      agUiResponse(scenarios["text-stream"], makeInput()),
    );
    const types = typesOf(events);

    expect(types).toContain("TEXT_MESSAGE_START");
    expect(types).toContain("TEXT_MESSAGE_CONTENT");
    expect(types).toContain("TEXT_MESSAGE_END");
    expect(types.indexOf("TEXT_MESSAGE_START")).toBeLessThan(
      types.indexOf("TEXT_MESSAGE_END"),
    );
  });

  it("merges custom headers over the SSE defaults", () => {
    const response = agUiResponse(scenarios["text-stream"], makeInput(), {
      headers: { "x-stub": "1" },
    });
    expect(response.headers.get("x-stub")).toBe("1");
    expect(response.headers.get("content-type")).toBe("text/event-stream");
  });
});
