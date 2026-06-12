import { createDOM } from "@qwik.dev/core/testing";
import { describe, expect, test } from "vitest";

import { ElmTooltip } from "./elm-tooltip";
import { renderToString } from "@qwik.dev/core/server";

// Hover behavior lives in elm-tooltip.browser.spec.tsx: the mouseover handler
// reads `getBoundingClientRect()` / `window.innerWidth` for positioning, which
// createDOM does not implement (the call throws). The unit layer covers the
// static render of both slots.

describe("[CSR]", () => {
  test("Should render both slots", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmTooltip>
        <span q:slot="original">trigger</span>
        <span q:slot="tooltip">tip body</span>
      </ElmTooltip>,
    );
    expect(screen.outerHTML).toContain("trigger");
    expect(screen.outerHTML).toContain("tip body");
  });
});

describe("[SSR]", () => {
  test("Should render both slots on the server", async () => {
    const renderResult = await renderToString(
      <ElmTooltip>
        <span q:slot="original">trigger</span>
        <span q:slot="tooltip">tip body</span>
      </ElmTooltip>,
      { containerTagName: "div" },
    );
    expect(renderResult.html).toContain("trigger");
    expect(renderResult.html).toContain("tip body");
  });
});
