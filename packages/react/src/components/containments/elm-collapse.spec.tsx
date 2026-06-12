import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmCollapse } from "./elm-collapse";

describe("[CSR] ElmCollapse", () => {
  it("renders children inside the inner wrapper", () => {
    const { container } = render(
      <ElmCollapse>
        <span>Content</span>
      </ElmCollapse>,
    );
    expect(container).toHaveTextContent("Content");
  });

  it("renders children with isOpen={false}", () => {
    const { container } = render(
      <ElmCollapse isOpen={false}>
        <>With Fragment</>
      </ElmCollapse>,
    );
    expect(container).toHaveTextContent("With Fragment");
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmCollapse className="custom-class">x</ElmCollapse>,
    );
    expect(container.firstElementChild).toHaveClass("custom-class");
  });

  it("transitionTimingFunction flows into a scoped CSS custom property", () => {
    const { container } = render(
      <ElmCollapse transitionTimingFunction="linear">x</ElmCollapse>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(
      root.style.getPropertyValue(
        "--elmethis-scoped-transition-timing-function",
      ),
    ).toBe("linear");
  });
});

describe("[SSR] ElmCollapse", () => {
  it("renders children server-side", () => {
    const html = renderToStaticMarkup(
      <ElmCollapse>
        <span>Content</span>
      </ElmCollapse>,
    );
    expect(html).toContain("Content");
  });
});
