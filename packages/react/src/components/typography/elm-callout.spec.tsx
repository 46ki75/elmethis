import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmCallout, type AlertType } from "./elm-callout";

const TYPES: AlertType[] = ["note", "tip", "important", "warning", "caution"];

describe("[CSR] ElmCallout", () => {
  it("renders children inside an <aside>", () => {
    const { container } = render(<ElmCallout>callout body</ElmCallout>);
    const aside = container.querySelector("aside");
    expect(aside).not.toBeNull();
    expect(aside).toHaveTextContent("callout body");
  });

  it("defaults to the 'note' type", () => {
    const { container } = render(<ElmCallout>x</ElmCallout>);
    expect(container.querySelector("aside")).toHaveTextContent("note");
  });

  // Each variant renders its name in the header and a distinct icon <svg>.
  for (const type of TYPES) {
    it(`type='${type}' labels the header and renders an icon`, () => {
      const { container } = render(<ElmCallout type={type}>x</ElmCallout>);
      expect(container.querySelector("aside")).toHaveTextContent(type);
      expect(container.querySelector("svg")).not.toBeNull();
    });
  }

  // The variant icons are distinct paths — confirm two different types produce
  // different markup so the ICON_MAP lookup is actually exercised.
  it("different types render different icon paths", () => {
    const pathOf = (type: AlertType) => {
      const { container } = render(<ElmCallout type={type}>x</ElmCallout>);
      return container.querySelector("path")?.getAttribute("d") ?? "";
    };
    expect(pathOf("note")).not.toBe("");
    expect(pathOf("note")).not.toBe(pathOf("warning"));
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmCallout className="custom-class">x</ElmCallout>,
    );
    expect(container.querySelector("aside")).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmCallout", () => {
  it("renders the aside, label and body server-side", () => {
    const html = renderToStaticMarkup(
      <ElmCallout type="tip">ssr-callout</ElmCallout>,
    ).toLowerCase();
    expect(html).toContain("<aside");
    expect(html).toContain("tip");
    expect(html).toContain("ssr-callout");
  });
});
