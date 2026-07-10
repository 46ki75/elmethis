import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import {
  ElmNotionCallout,
  type NotionCalloutColor,
} from "./elm-notion-callout";
import styles from "./elm-notion-callout.module.css";

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
    const wrapper = mount(ElmNotionCallout, {
      slots: { default: () => "callout body" },
    });
    expect(wrapper.element.tagName).toBe("DIV");
    expect(wrapper.text()).toContain("callout body");
  });

  it("renders no icon by default", () => {
    const wrapper = mount(ElmNotionCallout, {
      slots: { default: () => "x" },
    });
    expect(wrapper.find("img").exists()).toBe(false);
    expect(wrapper.find("[role='img']").exists()).toBe(false);
  });

  it("renders an emoji icon", () => {
    const wrapper = mount(ElmNotionCallout, {
      props: { icon: { kind: "emoji", emoji: "💡" } },
      slots: { default: () => "x" },
    });
    const icon = wrapper.find("[role='img']");
    expect(icon.exists()).toBe(true);
    expect(icon.text()).toContain("💡");
  });

  it("renders an image icon", () => {
    const wrapper = mount(ElmNotionCallout, {
      props: { icon: { kind: "image", src: "/icon.png", alt: "icon" } },
      slots: { default: () => "x" },
    });
    const img = wrapper.find("img");
    expect(img.exists()).toBe(true);
    expect(img.attributes("src")).toBe("/icon.png");
    expect(img.attributes("alt")).toBe("icon");
  });

  it("does not render flavor text for the color", () => {
    const wrapper = mount(ElmNotionCallout, {
      props: { color: "red" },
      slots: { default: () => "x" },
    });
    expect(wrapper.text()).not.toContain("red");
  });

  for (const color of COLORS) {
    it(`color='${color}' applies a distinct class`, () => {
      const wrapper = mount(ElmNotionCallout, {
        props: { color },
        slots: { default: () => "x" },
      });
      expect(wrapper.classes()).toContain(styles[color]);
    });
  }

  it("defaults to the 'filled' variant", () => {
    const wrapper = mount(ElmNotionCallout, {
      slots: { default: () => "x" },
    });
    expect(wrapper.classes()).toContain(styles.filled);
  });

  it("switches to the 'outlined' variant", () => {
    const wrapper = mount(ElmNotionCallout, {
      props: { variant: "outlined" },
      slots: { default: () => "x" },
    });
    expect(wrapper.classes()).toContain(styles.outlined);
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmNotionCallout, {
      attrs: { class: "custom-class" },
      slots: { default: () => "x" },
    });
    expect(wrapper.classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmNotionCallout", () => {
  it("renders the callout and body server-side", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () =>
            h(
              ElmNotionCallout,
              { color: "blue", icon: { kind: "emoji", emoji: "📌" } },
              { default: () => "ssr-callout" },
            ),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<div");
    expect(html).toContain("ssr-callout");
    expect(html).toContain("📌");
  });
});
