// @vitest-environment happy-dom

import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";

import { ElmToggleTheme } from "./elm-toggle-theme";

// ElmToggleTheme drives useElmethisTheme — real theme toggling (color-scheme /
// localStorage / cross-tab) is covered by use-elmethis-theme.spec. Here we
// only assert the toggle control renders and respects the size prop. Default
// (light) shows the sun→moon transition svg.

describe("[CSR]", () => {
  test("renders the svg toggle control", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmToggleTheme />);
    const svg = screen.querySelector("svg");
    expect(svg).toBeTruthy();
    // The theme hook wires its cross-tab listeners onto the host element,
    // proving the toggle is live rather than a static glyph.
    expect(screen.outerHTML).toContain("q-w:storage");
  });

  test("size prop drives the svg width and height", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmToggleTheme size="3rem" />);
    const html = screen.outerHTML;
    expect(html).toContain('width="3rem"');
    expect(html).toContain('height="3rem"');
  });
});
