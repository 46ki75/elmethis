import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmToggleTheme } from "./elm-toggle-theme";

// ElmToggleTheme drives useElmethisTheme — real theme toggling (color-scheme /
// localStorage / cross-tab) is covered by use-elmethis-theme's own browser
// spec. Here we only assert the toggle control renders and respects the size
// prop. The unit DOM can't fake a real color-scheme, so we stick to
// render/structure assertions.

describe("[CSR] ElmToggleTheme", () => {
  it("renders the svg toggle control", () => {
    const { container } = render(<ElmToggleTheme />);
    expect(container.querySelector("svg")).not.toBeNull();
  });

  it("defaults the svg size to 2rem", () => {
    const { container } = render(<ElmToggleTheme />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("2rem");
    expect(svg.getAttribute("height")).toBe("2rem");
  });

  it("size prop drives the svg width and height", () => {
    const { container } = render(<ElmToggleTheme size="3rem" />);
    const svg = container.querySelector("svg")!;
    expect(svg.getAttribute("width")).toBe("3rem");
    expect(svg.getAttribute("height")).toBe("3rem");
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(<ElmToggleTheme className="custom-class" />);
    expect(container.querySelector("svg")).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmToggleTheme", () => {
  it("renders the svg server-side", () => {
    const html = renderToStaticMarkup(<ElmToggleTheme />).toLowerCase();
    expect(html).toContain("<svg");
    expect(html).toContain('width="2rem"');
  });
});
