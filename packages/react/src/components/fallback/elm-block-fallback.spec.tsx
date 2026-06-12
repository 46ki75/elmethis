import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmBlockFallback } from "./elm-block-fallback";

// ElmBlockFallback composes the dot-loading icon with the rectangle-wave
// shimmer inside a sized root. It is a pure presentational composite: assert
// both children render and that the `height` prop reaches the scoped custom
// property.

describe("[CSR] ElmBlockFallback", () => {
  it("renders the dot-loading icon and the rectangle-wave", () => {
    const { container } = render(<ElmBlockFallback />);

    const root = container.querySelector('[class*="elm-block-fallback"]');
    expect(root).toBeTruthy();
    // Dot-loading icon (three dots) and the shimmer placeholder both mount.
    expect(
      container.querySelector('[class*="elm-dot-loading-icon"]'),
    ).toBeTruthy();
    expect(
      container.querySelector('[class*="elm-rectangle-wave"]'),
    ).toBeTruthy();
  });

  it("default height feeds the --elmethis-scoped-height custom property", () => {
    const { container } = render(<ElmBlockFallback />);

    const root = container.querySelector(
      '[class*="elm-block-fallback"]',
    ) as HTMLElement;
    expect(root.style.getPropertyValue("--elmethis-scoped-height")).toBe(
      "16rem",
    );
  });

  it("custom height overrides the default", () => {
    const { container } = render(<ElmBlockFallback height="32rem" />);

    const root = container.querySelector(
      '[class*="elm-block-fallback"]',
    ) as HTMLElement;
    expect(root.style.getPropertyValue("--elmethis-scoped-height")).toBe(
      "32rem",
    );
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(<ElmBlockFallback className="custom-class" />);
    expect(
      container.querySelector('[class*="elm-block-fallback"]'),
    ).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmBlockFallback", () => {
  it("server HTML includes both the loading icon and the shimmer", () => {
    const html = renderToStaticMarkup(<ElmBlockFallback />);
    expect(html).toContain("elm-dot-loading-icon");
    expect(html).toContain("elm-rectangle-wave");
  });
});
