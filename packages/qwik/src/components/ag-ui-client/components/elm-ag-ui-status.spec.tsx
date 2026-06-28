import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";

import { ElmAgUiStatus } from "./elm-ag-ui-status";

// ElmAgUiStatus maps (status, activity) onto an icon + label, animating while a
// run is in flight and rendering nothing when idle. These are pure mapping
// assertions; the `role="status"` attribute is a stable hook independent of the
// hashed CSS-module class names.

const renderHTML = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML;
};

describe("[CSR] ElmAgUiStatus", () => {
  test("renders nothing when idle", async () => {
    const html = await renderHTML(<ElmAgUiStatus status="idle" />);
    expect(html).not.toContain('role="status"');
  });

  test("shows the activity label while running", async () => {
    const html = await renderHTML(
      <ElmAgUiStatus status="running" activity="thinking" />,
    );
    expect(html).toContain('role="status"');
    expect(html).toContain("Thinking");
  });

  test("maps each activity to its own label", async () => {
    expect(
      await renderHTML(<ElmAgUiStatus status="running" activity="writing" />),
    ).toContain("Writing");
    expect(
      await renderHTML(
        <ElmAgUiStatus status="running" activity="calling_tool" />,
      ),
    ).toContain("Calling a tool");
    expect(
      await renderHTML(
        <ElmAgUiStatus status="running" activity="updating_state" />,
      ),
    ).toContain("Updating");
  });

  test("running falls back to a generic label when activity is idle", async () => {
    const html = await renderHTML(<ElmAgUiStatus status="running" />);
    expect(html).toContain("Working");
  });

  test("awaiting_input prompts for user input", async () => {
    const html = await renderHTML(<ElmAgUiStatus status="awaiting_input" />);
    expect(html).toContain("Waiting for your input");
  });

  test("terminal states render their own copy", async () => {
    expect(await renderHTML(<ElmAgUiStatus status="success" />)).toContain(
      "Done",
    );
    expect(await renderHTML(<ElmAgUiStatus status="error" />)).toContain(
      "Something went wrong",
    );
    expect(await renderHTML(<ElmAgUiStatus status="aborted" />)).toContain(
      "Stopped",
    );
  });

  test("a custom label overrides the default", async () => {
    const html = await renderHTML(
      <ElmAgUiStatus status="running" activity="writing" label="生成中…" />,
    );
    expect(html).toContain("生成中…");
    expect(html).not.toContain("Writing");
  });
});
