import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { EventType } from "@ag-ui/core";
import { afterEach, describe, expect, it, vi } from "vitest";

import toggleStyles from "../../containments/elm-toggle.module.css";
import {
  ElmAgUiToolExecution,
  type ElmAgUiToolExecutionProps,
} from "./elm-ag-ui-tool-execution";

afterEach(() => vi.useRealTimers());

describe("[CSR] ElmAgUiToolExecution", () => {
  it("plays the args disclosure once when lifecycle state regresses and repeats", async () => {
    vi.useFakeTimers();
    const [eventType, setEventType] =
      createSignal<ElmAgUiToolExecutionProps["toolEventType"]>();
    const rendered = render(() => (
      <ElmAgUiToolExecution
        toolName="get_weather"
        toolEventType={eventType()}
      />
    ));

    setEventType(EventType.TOOL_CALL_START);
    await Promise.resolve();
    await vi.advanceTimersByTimeAsync(0);
    const argsToggle = rendered
      .getByText("Args")
      .closest(`.${toggleStyles["elm-toggle"]}`);
    expect(argsToggle).not.toBeNull();

    setEventType(EventType.TOOL_CALL_ARGS);
    await Promise.resolve();
    setEventType(EventType.TOOL_CALL_START);
    await Promise.resolve();
    setEventType(EventType.TOOL_CALL_ARGS);
    await Promise.resolve();

    const openStates: boolean[] = [];
    for (let index = 0; index < 5; index += 1) {
      await vi.advanceTimersByTimeAsync(200);
      openStates.push(
        argsToggle?.classList.contains(toggleStyles.open) ?? false,
      );
    }

    expect(openStates).toEqual([true, false, false, false, false]);
  });
});
