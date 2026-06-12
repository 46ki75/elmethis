import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmUnsupportedBlock } from "./elm-unsupported-block";

// ElmUnsupportedBlock is the static placeholder shown for blocks the renderer
// can't handle. It always shows the "UNSUPPORTED BLOCK" message + warning icon,
// and conditionally renders a `details` sub-line.

describe("[CSR] ElmUnsupportedBlock", () => {
  it("renders the UNSUPPORTED BLOCK message with the warning icon", () => {
    const { container } = render(<ElmUnsupportedBlock />);

    expect(
      container.querySelector('[class*="elm-unsupported-block"]'),
    ).toBeTruthy();
    expect(container.querySelector("svg")).toBeTruthy();
    expect(container.innerHTML).toContain("UNSUPPORTED BLOCK");
  });

  it("omits the details line when no details prop is given", () => {
    const { container } = render(<ElmUnsupportedBlock />);

    expect(container.querySelector('[class*="details"]')).toBeFalsy();
  });

  it("renders the details line when details is supplied", () => {
    const { container } = render(
      <ElmUnsupportedBlock details="type: mermaid" />,
    );

    const details = container.querySelector('[class*="details"]');
    expect(details).toBeTruthy();
    expect(container.innerHTML).toContain("type: mermaid");
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmUnsupportedBlock className="custom-class" />,
    );
    expect(
      container.querySelector('[class*="elm-unsupported-block"]'),
    ).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmUnsupportedBlock", () => {
  it("server HTML emits the message, and the details only when provided", () => {
    const without = renderToStaticMarkup(<ElmUnsupportedBlock />);
    expect(without).toContain("UNSUPPORTED BLOCK");
    expect(without).not.toContain("type: mermaid");

    const withDetails = renderToStaticMarkup(
      <ElmUnsupportedBlock details="type: mermaid" />,
    );
    expect(withDetails).toContain("type: mermaid");
  });
});
