import { describe, expect, it } from "vitest";

import { createStubFetch } from "./stub-fetch";
import { collectEvents, makeInput, typesOf } from "./test-support";

const post = (fetchImpl: typeof fetch, url: string) =>
  fetchImpl(url, { method: "POST", body: JSON.stringify(makeInput()) });

describe("createStubFetch", () => {
  it("resolves the scenario from the `/agent/:scenario/run` path", async () => {
    const stubFetch = createStubFetch();
    const response = await post(
      stubFetch,
      "http://localhost/stub/agent/tool-call/run",
    );

    expect(response.headers.get("content-type")).toBe("text/event-stream");
    expect(typesOf(await collectEvents(response))).toContain("TOOL_CALL_START");
  });

  it("falls back to text-stream for an unknown scenario", async () => {
    const stubFetch = createStubFetch();
    const response = await post(
      stubFetch,
      "http://localhost/stub/agent/does-not-exist/run",
    );

    expect(typesOf(await collectEvents(response))).toContain(
      "TEXT_MESSAGE_START",
    );
  });

  it("honors a custom resolveScenario override", async () => {
    const stubFetch = createStubFetch({
      resolveScenario: () => undefined,
      fallback: "error",
    });
    const response = await post(stubFetch, "http://localhost/whatever");

    expect(typesOf(await collectEvents(response))).toContain("RUN_ERROR");
  });
});
