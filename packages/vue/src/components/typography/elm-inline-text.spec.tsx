import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmInlineText } from "./elm-inline-text";

// Default slot content is passed via the `default` slot (Vue's equivalent of
// React `children`).
const text = (content: string) => ({ default: () => content });

describe("[CSR] ElmInlineText", () => {
  it("renders children inside a <span>", () => {
    const wrapper = mount(ElmInlineText, { slots: text("hello") });
    const span = wrapper.find("span");
    expect(span.exists()).toBe(true);
    expect(span.text()).toContain("hello");
  });

  // Each variant prop wraps the text in a dedicated semantic element. They are
  // independent, so assert one tag per prop.
  it("bold wraps in <strong>", () => {
    const wrapper = mount(ElmInlineText, {
      props: { bold: true },
      slots: text("b"),
    });
    expect(wrapper.find("strong").exists()).toBe(true);
  });

  it("italic wraps in <em>", () => {
    const wrapper = mount(ElmInlineText, {
      props: { italic: true },
      slots: text("i"),
    });
    expect(wrapper.find("em").exists()).toBe(true);
  });

  it("underline wraps in <ins>", () => {
    const wrapper = mount(ElmInlineText, {
      props: { underline: true },
      slots: text("u"),
    });
    expect(wrapper.find("ins").exists()).toBe(true);
  });

  it("strikethrough wraps in <del>", () => {
    const wrapper = mount(ElmInlineText, {
      props: { strikethrough: true },
      slots: text("s"),
    });
    expect(wrapper.find("del").exists()).toBe(true);
  });

  it("code wraps in <code>", () => {
    const wrapper = mount(ElmInlineText, {
      props: { code: true },
      slots: text("c"),
    });
    expect(wrapper.find("code").exists()).toBe(true);
  });

  it("kbd wraps in <kbd>", () => {
    const wrapper = mount(ElmInlineText, {
      props: { kbd: true },
      slots: text("k"),
    });
    expect(wrapper.find("kbd").exists()).toBe(true);
  });

  it("ruby renders <ruby> with the annotation in <rt>", () => {
    const wrapper = mount(ElmInlineText, {
      props: { ruby: "annotation" },
      slots: text("base"),
    });
    expect(wrapper.find("ruby").exists()).toBe(true);
    expect(wrapper.find("rt").text()).toContain("annotation");
    expect(wrapper.text()).toContain("base");
  });

  it("href renders an external <a> with safe rel/target", () => {
    const wrapper = mount(ElmInlineText, {
      props: { href: "https://example.com" },
      slots: text("link"),
    });
    const a = wrapper.find("a");
    expect(a.exists()).toBe(true);
    expect(a.attributes("href")).toBe("https://example.com");
    expect(a.attributes("target")).toBe("_blank");
    expect(a.attributes("rel")).toBe("noopener noreferrer");
  });

  it("favicon renders an inline icon image inside the link", () => {
    const wrapper = mount(ElmInlineText, {
      props: {
        href: "https://example.com",
        favicon: "https://example.com/f.ico",
      },
      slots: text("link"),
    });
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("https://example.com/f.ico");
  });

  it("favicon is ignored without an href (no link wrapper)", () => {
    const wrapper = mount(ElmInlineText, {
      props: { favicon: "https://example.com/f.ico" },
      slots: text("plain"),
    });
    expect(wrapper.find("a").exists()).toBe(false);
    expect(wrapper.find("img").exists()).toBe(false);
  });

  // Variant props compose by nesting their wrappers; verify multiple apply at once.
  it("bold + italic + code nest together", () => {
    const wrapper = mount(ElmInlineText, {
      props: { bold: true, italic: true, code: true },
      slots: text("x"),
    });
    expect(wrapper.find("strong").exists()).toBe(true);
    expect(wrapper.find("em").exists()).toBe(true);
    expect(wrapper.find("code").exists()).toBe(true);
  });

  it("color/size/backgroundColor flow into scoped CSS custom properties", () => {
    const wrapper = mount(ElmInlineText, {
      props: { color: "red", size: "2em", backgroundColor: "blue" },
      slots: text("x"),
    });
    const span = wrapper.find("span").element as HTMLElement;
    expect(span.style.getPropertyValue("--elmethis-scoped-color")).toBe("red");
    expect(span.style.getPropertyValue("--elmethis-scoped-font-size")).toBe(
      "2em",
    );
    expect(
      span.style.getPropertyValue("--elmethis-scoped-background-color"),
    ).toBe("blue");
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmInlineText, {
      attrs: { class: "custom-class" },
      slots: text("x"),
    });
    expect(wrapper.find("span").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmInlineText", () => {
  it("renders text in the server shell", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () => h(ElmInlineText, null, text("server")),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<span");
    expect(html).toContain("server");
  });

  it("variant wrappers are present server-side", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () => h(ElmInlineText, { bold: true, code: true }, text("x")),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<strong");
    expect(html).toContain("<code");
  });
});
