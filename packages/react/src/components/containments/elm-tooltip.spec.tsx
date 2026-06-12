import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmTooltip } from "./elm-tooltip";

// Hover behavior lives in elm-tooltip.browser.spec.tsx: the mouseover handler
// reads `getBoundingClientRect()` / `window.innerWidth` for positioning, which
// jsdom does not implement faithfully. The unit layer covers the static render
// of both the trigger and the tooltip content.

describe("[CSR] ElmTooltip", () => {
  it("renders both the trigger and the tooltip content", () => {
    const { container } = render(
      <ElmTooltip
        original={<span>trigger</span>}
        tooltip={<span>tip body</span>}
      />,
    );
    expect(container).toHaveTextContent("trigger");
    expect(container).toHaveTextContent("tip body");
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmTooltip className="custom-class" original="x" tooltip="y" />,
    );
    expect(container.querySelector("span")).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmTooltip", () => {
  it("renders both slots server-side", () => {
    const html = renderToStaticMarkup(
      <ElmTooltip original="trigger" tooltip="tip body" />,
    );
    expect(html).toContain("trigger");
    expect(html).toContain("tip body");
  });
});
