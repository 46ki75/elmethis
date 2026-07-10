import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import {
  ElmNotionCallout,
  type NotionCalloutColor,
} from "./elm-notion-callout";

const COLORS: NotionCalloutColor[] = [
  "default",
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "magenta",
];

describe("[CSR] ElmNotionCallout", () => {
  it("renders children inside a <div>", () => {
    const { container } = render(
      <ElmNotionCallout>callout body</ElmNotionCallout>,
    );
    const root = container.firstElementChild;
    expect(root?.tagName).toBe("DIV");
    expect(root).toHaveTextContent("callout body");
  });

  it("renders no icon by default", () => {
    const { container } = render(<ElmNotionCallout>x</ElmNotionCallout>);
    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("[role='img']")).toBeNull();
  });

  it("renders an emoji icon", () => {
    const { container } = render(
      <ElmNotionCallout icon={{ kind: "emoji", emoji: "💡" }}>
        x
      </ElmNotionCallout>,
    );
    const icon = container.querySelector("[role='img']");
    expect(icon).not.toBeNull();
    expect(icon).toHaveTextContent("💡");
  });

  it("renders an image icon", () => {
    const { container } = render(
      <ElmNotionCallout icon={{ kind: "image", src: "/icon.png", alt: "icon" }}>
        x
      </ElmNotionCallout>,
    );
    const img = container.querySelector("img");
    expect(img).not.toBeNull();
    expect(img).toHaveAttribute("src", "/icon.png");
    expect(img).toHaveAttribute("alt", "icon");
  });

  it("does not render flavor text for the color", () => {
    const { container } = render(
      <ElmNotionCallout color="red">x</ElmNotionCallout>,
    );
    expect(container.querySelector("div")).not.toHaveTextContent("red");
  });

  for (const color of COLORS) {
    it(`color='${color}' applies a distinct class`, () => {
      const { container } = render(
        <ElmNotionCallout color={color}>x</ElmNotionCallout>,
      );
      expect(container.firstElementChild?.className).toContain(color);
    });
  }

  it("defaults to the 'filled' variant", () => {
    const { container } = render(<ElmNotionCallout>x</ElmNotionCallout>);
    expect(container.firstElementChild?.className).toMatch(/filled/);
  });

  it("switches to the 'outlined' variant", () => {
    const { container } = render(
      <ElmNotionCallout variant="outlined">x</ElmNotionCallout>,
    );
    expect(container.firstElementChild?.className).toMatch(/outlined/);
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmNotionCallout className="custom-class">x</ElmNotionCallout>,
    );
    expect(container.firstElementChild).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmNotionCallout", () => {
  it("renders the callout and body server-side", () => {
    const html = renderToStaticMarkup(
      <ElmNotionCallout color="blue" icon={{ kind: "emoji", emoji: "📌" }}>
        ssr-callout
      </ElmNotionCallout>,
    ).toLowerCase();
    expect(html).toContain("<div");
    expect(html).toContain("ssr-callout");
    expect(html).toContain("📌");
  });
});
