import { describe, expect, it } from "vitest";
import { EventType, type TextMessageContentEvent } from "@ag-ui/core";

import { runFrame } from "../run-frame";
import { collectEvents, makeInput, typesOf } from "../test-support";
import { scenarioNames, scenarios } from "./index";

const run = (name: keyof typeof scenarios, input = makeInput()) =>
  collectEvents(runFrame(scenarios[name], input));

describe("scenario catalog", () => {
  it("every scenario produces a valid RUN_STARTED…terminal stream", async () => {
    for (const name of scenarioNames) {
      const types = typesOf(await run(name));
      expect(types[0]).toBe("RUN_STARTED");
      expect(["RUN_FINISHED", "RUN_ERROR"]).toContain(types.at(-1));
    }
  });

  it("tool-call emits the full tool lifecycle in order", async () => {
    const types = typesOf(await run("tool-call"));
    expect(types).toEqual(
      expect.arrayContaining([
        "TOOL_CALL_START",
        "TOOL_CALL_ARGS",
        "TOOL_CALL_END",
        "TOOL_CALL_RESULT",
      ]),
    );
    expect(types.indexOf("TOOL_CALL_START")).toBeLessThan(
      types.indexOf("TOOL_CALL_RESULT"),
    );
  });

  it("state emits a snapshot before its deltas", async () => {
    const types = typesOf(await run("state"));
    expect(types.indexOf("STATE_SNAPSHOT")).toBeGreaterThanOrEqual(0);
    expect(types.indexOf("STATE_SNAPSHOT")).toBeLessThan(
      types.indexOf("STATE_DELTA"),
    );
  });

  it("reasoning streams a reasoning block then the answer", async () => {
    const types = typesOf(await run("reasoning"));
    expect(types).toEqual(
      expect.arrayContaining([
        "REASONING_START",
        "REASONING_MESSAGE_CONTENT",
        "REASONING_END",
        "TEXT_MESSAGE_START",
      ]),
    );
  });

  it("interrupt pauses with an interrupt outcome when not resumed", async () => {
    const events = await run("interrupt");
    const finish = events.at(-1) as {
      type: string;
      outcome?: { type: string };
    };
    expect(finish.type).toBe("RUN_FINISHED");
    expect(finish.outcome).toMatchObject({ type: "interrupt" });
  });

  it("interrupt completes successfully once resumed", async () => {
    const events = await run(
      "interrupt",
      makeInput({
        resume: [{ interruptId: "stub-confirm-1", status: "resolved" }],
      }),
    );
    const finish = events.at(-1) as { type: string; outcome?: unknown };
    expect(finish.type).toBe("RUN_FINISHED");
    expect(finish.outcome).toBeUndefined();
  });

  it("messages-snapshot replaces the history", async () => {
    const types = typesOf(await run("messages-snapshot"));
    expect(types).toContain("MESSAGES_SNAPSHOT");
  });

  it("error ends the run with RUN_ERROR", async () => {
    const events = await run("error");
    expect(events.at(-1)).toMatchObject({ type: "RUN_ERROR" });
  });

  it("full chains reason → act → state → answer with step delimiters", async () => {
    const events = await run("full");
    const types = typesOf(events);

    // Every phase is represented...
    expect(types).toEqual(
      expect.arrayContaining([
        "STEP_STARTED",
        "REASONING_START",
        "TOOL_CALL_RESULT",
        "STATE_DELTA",
        "TEXT_MESSAGE_END",
        "STEP_FINISHED",
      ]),
    );
    // ...and they happen in order: reason, then act (tool), then answer.
    expect(types.indexOf("REASONING_START")).toBeLessThan(
      types.indexOf("TOOL_CALL_START"),
    );
    expect(types.indexOf("TOOL_CALL_RESULT")).toBeLessThan(
      types.indexOf("TEXT_MESSAGE_START"),
    );
    // Each step is opened and closed.
    const opened = types.filter((t) => t === "STEP_STARTED").length;
    const closed = types.filter((t) => t === "STEP_FINISHED").length;
    expect(opened).toBe(closed);
    expect(opened).toBeGreaterThan(0);

    const answer = events
      .filter(
        (event): event is TextMessageContentEvent =>
          event.type === EventType.TEXT_MESSAGE_CONTENT,
      )
      .map((event) => event.delta)
      .join("");
    expect(answer).toContain("## Tokyo weather");
    expect(answer.length).toBeGreaterThan(300);
  });

  it("long-stream emits many content chunks", async () => {
    const events = await run("long-stream");
    const contentCount = typesOf(events).filter(
      (t) => t === "TEXT_MESSAGE_CONTENT",
    ).length;
    expect(contentCount).toBeGreaterThan(100);
  });
});
