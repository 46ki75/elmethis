import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmHeading } from "./elm-heading";

const LEVELS = [1, 2, 3, 4, 5, 6] as const;

describe("[CSR] ElmHeading", () => {
  // `level` maps directly onto the `h{level}` tag — exercise every level.
  for (const level of LEVELS) {
    it(`level=${level} renders <h${level}>`, () => {
      const { container } = render(
        <ElmHeading level={level} text={`heading-${level}`} />,
      );
      expect(container.querySelector(`h${level}`)).not.toBeNull();
      expect(container).toHaveTextContent(`heading-${level}`);
    });
  }

  it("text prop renders inside the heading", () => {
    const { container } = render(<ElmHeading level={1} text="Title" />);
    expect(container).toHaveTextContent("Title");
  });

  it("children render alongside text", () => {
    const { container } = render(
      <ElmHeading level={3}>
        <span>slotted</span>
      </ElmHeading>,
    );
    expect(container).toHaveTextContent("slotted");
  });

  // The fragment-identifier anchor is only emitted when an `id` is supplied.
  it("with id: forwards id and renders the fragment-identifier anchor", () => {
    const { container } = render(
      <ElmHeading level={2} id="section-a" text="Section A" />,
    );
    expect(container.querySelector("#section-a")).not.toBeNull();
    // ElmFragmentIdentifier renders a literal `#`.
    expect(container).toHaveTextContent("#");
  });

  it("without id: no fragment-identifier anchor", () => {
    const { container } = render(<ElmHeading level={2} text="No anchor" />);
    expect(container.querySelector("[id]")).toBeNull();
  });

  it("level=2 emits the decorative underline span", () => {
    const { container } = render(<ElmHeading level={2} text="Underlined" />);
    expect(container.querySelector('[aria-hidden="true"]')).not.toBeNull();
  });

  it("scoped font-size custom property reflects the level", () => {
    const { container } = render(<ElmHeading level={1} text="x" />);
    const heading = container.querySelector("h1")!;
    expect(heading.style.getPropertyValue("--elmethis-scoped-font-size")).toBe(
      "1.5em",
    );
  });
});

describe("[SSR] ElmHeading", () => {
  it("renders the correct heading tag and text server-side", () => {
    const html = renderToStaticMarkup(
      <ElmHeading level={4} text="ssr-heading" />,
    ).toLowerCase();
    expect(html).toContain("<h4");
    expect(html).toContain("ssr-heading");
  });

  it("emits id server-side", () => {
    const html = renderToStaticMarkup(
      <ElmHeading level={1} id="ssr-id" text="x" />,
    ).toLowerCase();
    expect(html).toContain('id="ssr-id"');
  });
});
