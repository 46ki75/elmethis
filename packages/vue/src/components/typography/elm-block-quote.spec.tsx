import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmBlockQuote } from "./elm-block-quote";

describe("[CSR] ElmBlockQuote", () => {
  it("renders children inside a <blockquote>", () => {
    const wrapper = mount(ElmBlockQuote, {
      slots: { default: () => "quoted" },
    });
    expect(wrapper.find("blockquote").exists()).toBe(true);
    expect(wrapper.find("blockquote").text()).toContain("quoted");
  });

  // The open/close quote glyphs render as two decorative MDI <svg> icons.
  it("renders the two decorative quote icons", () => {
    const wrapper = mount(ElmBlockQuote, { slots: { default: () => "q" } });
    expect(wrapper.findAll("svg")).toHaveLength(2);
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmBlockQuote, {
      attrs: { class: "custom-class" },
      slots: { default: () => "x" },
    });
    expect(wrapper.find("blockquote").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmBlockQuote", () => {
  it("renders the blockquote and content server-side", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () => h(ElmBlockQuote, null, { default: () => "ssr-quote" }),
        }),
      )
    ).toLowerCase();
    expect(html).toContain("<blockquote");
    expect(html).toContain("ssr-quote");
  });
});
