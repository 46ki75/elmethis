import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmInlineText } from "./elm-inline-text";

describe("[CSR] ElmInlineText", () => {
  it("renders children inside a <span>", () => {
    const { container } = render(<ElmInlineText>hello</ElmInlineText>);
    const span = container.querySelector("span");
    expect(span).not.toBeNull();
    expect(span).toHaveTextContent("hello");
  });

  // Each variant prop wraps the text in a dedicated semantic element. They are
  // independent, so assert one tag per prop.
  it("bold wraps in <strong>", () => {
    const { container } = render(<ElmInlineText bold>b</ElmInlineText>);
    expect(container.querySelector("strong")).not.toBeNull();
  });

  it("italic wraps in <em>", () => {
    const { container } = render(<ElmInlineText italic>i</ElmInlineText>);
    expect(container.querySelector("em")).not.toBeNull();
  });

  it("underline wraps in <ins>", () => {
    const { container } = render(<ElmInlineText underline>u</ElmInlineText>);
    expect(container.querySelector("ins")).not.toBeNull();
  });

  it("strikethrough wraps in <del>", () => {
    const { container } = render(
      <ElmInlineText strikethrough>s</ElmInlineText>,
    );
    expect(container.querySelector("del")).not.toBeNull();
  });

  it("code wraps in <code>", () => {
    const { container } = render(<ElmInlineText code>c</ElmInlineText>);
    expect(container.querySelector("code")).not.toBeNull();
  });

  it("kbd wraps in <kbd>", () => {
    const { container } = render(<ElmInlineText kbd>k</ElmInlineText>);
    expect(container.querySelector("kbd")).not.toBeNull();
  });

  it("ruby renders <ruby> with the annotation in <rt>", () => {
    const { container } = render(
      <ElmInlineText ruby="annotation">base</ElmInlineText>,
    );
    expect(container.querySelector("ruby")).not.toBeNull();
    expect(container.querySelector("rt")).toHaveTextContent("annotation");
    expect(container).toHaveTextContent("base");
  });

  it("href renders an external <a> with safe rel/target", () => {
    const { container } = render(
      <ElmInlineText href="https://example.com">link</ElmInlineText>,
    );
    const a = container.querySelector("a")!;
    expect(a).not.toBeNull();
    expect(a.getAttribute("href")).toBe("https://example.com");
    expect(a.getAttribute("target")).toBe("_blank");
    expect(a.getAttribute("rel")).toBe("noopener noreferrer");
  });

  it("favicon renders an inline icon image inside the link", () => {
    const { container } = render(
      <ElmInlineText
        href="https://example.com"
        favicon="https://example.com/f.ico"
      >
        link
      </ElmInlineText>,
    );
    const img = container.querySelector("img")!;
    expect(img).not.toBeNull();
    expect(img.getAttribute("src")).toBe("https://example.com/f.ico");
  });

  it("favicon is ignored without an href (no link wrapper)", () => {
    const { container } = render(
      <ElmInlineText favicon="https://example.com/f.ico">plain</ElmInlineText>,
    );
    expect(container.querySelector("a")).toBeNull();
    expect(container.querySelector("img")).toBeNull();
  });

  // Variant props compose by nesting their wrappers; verify multiple apply at once.
  it("bold + italic + code nest together", () => {
    const { container } = render(
      <ElmInlineText bold italic code>
        x
      </ElmInlineText>,
    );
    expect(container.querySelector("strong")).not.toBeNull();
    expect(container.querySelector("em")).not.toBeNull();
    expect(container.querySelector("code")).not.toBeNull();
  });

  it("color/size/backgroundColor flow into scoped CSS custom properties", () => {
    const { container } = render(
      <ElmInlineText color="red" size="2em" backgroundColor="blue">
        x
      </ElmInlineText>,
    );
    const span = container.querySelector("span")!;
    expect(span.style.getPropertyValue("--elmethis-scoped-color")).toBe("red");
    expect(span.style.getPropertyValue("--elmethis-scoped-font-size")).toBe(
      "2em",
    );
    expect(
      span.style.getPropertyValue("--elmethis-scoped-background-color"),
    ).toBe("blue");
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmInlineText className="custom-class">x</ElmInlineText>,
    );
    expect(container.querySelector("span")).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmInlineText", () => {
  it("renders text in the server shell", () => {
    const html = renderToStaticMarkup(
      <ElmInlineText>server</ElmInlineText>,
    ).toLowerCase();
    expect(html).toContain("<span");
    expect(html).toContain("server");
  });

  it("variant wrappers are present server-side", () => {
    const html = renderToStaticMarkup(
      <ElmInlineText bold code>
        x
      </ElmInlineText>,
    ).toLowerCase();
    expect(html).toContain("<strong");
    expect(html).toContain("<code");
  });
});
