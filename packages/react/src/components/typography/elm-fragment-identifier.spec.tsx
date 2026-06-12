import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmFragmentIdentifier } from "./elm-fragment-identifier";

describe("[CSR] ElmFragmentIdentifier", () => {
  it("renders a `#` marker span", () => {
    const { container } = render(<ElmFragmentIdentifier id="intro" />);
    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span).toHaveTextContent("#");
  });

  // The id drives the click-to-hash behavior; it is captured in the handler
  // closure rather than reflected as a DOM attribute, so assert the marker
  // renders for an arbitrary id without throwing.
  it("renders for an arbitrary id", () => {
    const { container } = render(<ElmFragmentIdentifier id="some-section-2" />);
    expect(container.querySelector("span")).toHaveTextContent("#");
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmFragmentIdentifier id="intro" className="custom-class" />,
    );
    expect(container.querySelector("span")).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmFragmentIdentifier", () => {
  it("renders the marker in the server shell", () => {
    const html = renderToStaticMarkup(
      <ElmFragmentIdentifier id="intro" />,
    ).toLowerCase();
    expect(html).toContain("<span");
    expect(html).toContain("#");
  });
});
