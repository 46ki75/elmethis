import { createDOM } from "@qwik.dev/core/testing";
import { describe, expect, test } from "vitest";

import { ElmToggle } from "./elm-toggle";
import { renderToString } from "@qwik.dev/core/server";

// Click-driven toggling lives in elm-toggle.browser.spec.tsx: the summary's
// inline `$()` onClick (with `preventdefault:click`) does not resolve/mutate
// under createDOM. The unit layer covers render, slots, SSR, and the
// statically-derived `open` modifier for the uncontrolled defaultIsOpen path.

describe("[CSR]", () => {
  test("Should render summary and slot content", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmToggle summary="Summary text">
        <span>Body content</span>
      </ElmToggle>,
    );
    expect(screen.outerHTML).toContain("Summary text");
    expect(screen.outerHTML).toContain("Body content");
  });

  // The named `summary` slot is used only when the `summary` prop is absent.
  test("Should render summary slot when summary prop is omitted", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmToggle>
        <span q:slot="summary">Slotted summary</span>
        <span>Content</span>
      </ElmToggle>,
    );
    expect(screen.outerHTML).toContain("Slotted summary");
  });

  // Uncontrolled: the internal signal seeds from `defaultIsOpen`, so the root
  // carries the `open` modifier at first render without a parent-owned signal.
  test("Should carry the open modifier when defaultIsOpen is true", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmToggle summary="S" defaultIsOpen={true}>
        <span>Content</span>
      </ElmToggle>,
    );
    const root = screen.querySelector("[class*='elm-toggle']");
    expect(root?.className).toContain("open");
  });

  test("Should not carry the open modifier when closed by default", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmToggle summary="S">
        <span>Content</span>
      </ElmToggle>,
    );
    const root = screen.querySelector("[class*='elm-toggle']");
    expect(root?.className).not.toContain("open");
  });
});

describe("[SSR]", () => {
  test("Should render summary and content on the server", async () => {
    const renderResult = await renderToString(
      <ElmToggle summary="Summary text">
        <span>Body content</span>
      </ElmToggle>,
      { containerTagName: "div" },
    );
    expect(renderResult.html).toContain("Summary text");
    expect(renderResult.html).toContain("Body content");
  });
});
