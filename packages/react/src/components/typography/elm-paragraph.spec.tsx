import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmParagraph } from "./elm-paragraph";

describe("[CSR] ElmParagraph", () => {
  it("renders children inside a <p>", () => {
    const { container } = render(<ElmParagraph>paragraph text</ElmParagraph>);
    const p = container.querySelector("p");
    expect(p).not.toBeNull();
    expect(p).toHaveTextContent("paragraph text");
  });

  it("color/backgroundColor flow into scoped CSS custom properties", () => {
    const { container } = render(
      <ElmParagraph color="green" backgroundColor="yellow">
        x
      </ElmParagraph>,
    );
    const p = container.querySelector("p")!;
    expect(p.style.getPropertyValue("--elmethis-scoped-color")).toBe("green");
    expect(p.style.getPropertyValue("--elmethis-scoped-background-color")).toBe(
      "yellow",
    );
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmParagraph className="custom-class">x</ElmParagraph>,
    );
    expect(container.querySelector("p")).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmParagraph", () => {
  it("renders the paragraph and text server-side", () => {
    const html = renderToStaticMarkup(
      <ElmParagraph>ssr-paragraph</ElmParagraph>,
    ).toLowerCase();
    expect(html).toContain("<p");
    expect(html).toContain("ssr-paragraph");
  });
});
