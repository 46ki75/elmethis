import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmBlockFallback } from "./elm-block-fallback";

// ElmBlockFallback composes the dot-loading icon with the rectangle-wave
// shimmer inside a sized root. It is a pure presentational composite: assert
// both children render and that the `height` prop reaches the scoped custom
// property.

describe("[CSR] ElmBlockFallback", () => {
  test("renders the dot-loading icon and the rectangle-wave", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmBlockFallback />);

    const root = screen.querySelector('[class*="elm-block-fallback"]')!;
    expect(root).toBeTruthy();
    // Dot-loading icon (three dots) and the shimmer placeholder both mount.
    expect(
      screen.querySelector('[class*="elm-dot-loading-icon"]'),
    ).toBeTruthy();
    expect(screen.querySelector('[class*="elm-rectangle-wave"]')).toBeTruthy();
  });

  test("default height feeds the --elmethis-scoped-height custom property", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmBlockFallback />);

    const root = screen.querySelector(
      '[class*="elm-block-fallback"]',
    ) as HTMLElement;
    expect(root.getAttribute("style")).toContain(
      "--elmethis-scoped-height:16rem",
    );
  });

  test("custom height overrides the default", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmBlockFallback height="32rem" />);

    const root = screen.querySelector(
      '[class*="elm-block-fallback"]',
    ) as HTMLElement;
    expect(root.getAttribute("style")).toContain(
      "--elmethis-scoped-height:32rem",
    );
  });
});

describe("[SSR] ElmBlockFallback", () => {
  test("server HTML includes both the loading icon and the shimmer", async () => {
    const { html } = await renderToString(<ElmBlockFallback />, {
      containerTagName: "div",
    });
    expect(html).toContain("elm-dot-loading-icon");
    expect(html).toContain("elm-rectangle-wave");
  });
});
