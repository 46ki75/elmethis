import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { EventType } from "@ag-ui/core";

import { ElmAgUiToolExecution } from "./elm-ag-ui-tool-execution";

// Smoke-level render coverage. The component's `isArgsShown` / `isResultShown`
// visibility is driven by a throttled `useVisibleTask$` queue that doesn't
// fire deterministically under createDOM, so these tests assert the
// synchronous scaffolding (tool name, the always-rendered "Preparing
// arguments…" line, and the phase label that derives directly from
// `toolEventType`). The throttled stream choreography is left to Storybook /
// browser coverage.

describe("[CSR] ElmAgUiToolExecution", () => {
  test("renders the tool name in the summary", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmAgUiToolExecution
        toolName="search_web"
        toolEventType={EventType.TOOL_CALL_START}
      />,
    );
    expect(screen.outerHTML).toContain("search_web");
    expect(screen.outerHTML).toContain("Preparing arguments...");
  });

  test("TOOL_CALL_START hides the execution phase line", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmAgUiToolExecution
        toolName="t"
        toolEventType={EventType.TOOL_CALL_START}
      />,
    );
    // At START there's no result/execution affordance yet.
    expect(screen.outerHTML).not.toContain("Executing...");
    expect(screen.outerHTML).not.toContain("Execution completed");
  });

  test("TOOL_CALL_ARGS shows the 'Executing…' phase label", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmAgUiToolExecution
        toolName="t"
        toolEventType={EventType.TOOL_CALL_ARGS}
        toolCallArgs={'{"q":"hi"}'}
      />,
    );
    expect(screen.outerHTML).toContain("Executing...");
  });

  test("TOOL_CALL_RESULT shows the 'Execution completed' phase label", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmAgUiToolExecution
        toolName="t"
        toolEventType={EventType.TOOL_CALL_RESULT}
        toolCallArgs={'{"q":"hi"}'}
        toolCallResult={'{"ok":true}'}
      />,
    );
    expect(screen.outerHTML).toContain("Execution completed");
  });

  test("renders without crashing when no event type is supplied", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmAgUiToolExecution toolName="bare" />);
    expect(screen.outerHTML).toContain("bare");
  });
});
