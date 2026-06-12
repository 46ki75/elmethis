import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmBlockQuote } from "./elm-block-quote";

describe("[CSR] ElmBlockQuote", () => {
  it("renders children inside a <blockquote>", () => {
    const { container } = render(<ElmBlockQuote>quoted</ElmBlockQuote>);
    const blockquote = container.querySelector("blockquote");
    expect(blockquote).not.toBeNull();
    expect(blockquote).toHaveTextContent("quoted");
  });

  // The open/close quote glyphs render as two decorative MDI <svg> icons.
  it("renders the two decorative quote icons", () => {
    const { container } = render(<ElmBlockQuote>q</ElmBlockQuote>);
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmBlockQuote className="custom-class">x</ElmBlockQuote>,
    );
    expect(container.querySelector("blockquote")).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmBlockQuote", () => {
  it("renders the blockquote and content server-side", () => {
    const html = renderToStaticMarkup(
      <ElmBlockQuote>ssr-quote</ElmBlockQuote>,
    ).toLowerCase();
    expect(html).toContain("<blockquote");
    expect(html).toContain("ssr-quote");
  });
});
