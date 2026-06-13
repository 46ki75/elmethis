import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmParagraph } from "./elm-paragraph";

const text = (content: string) => ({ default: () => content });

describe("[CSR] ElmParagraph", () => {
  it("renders children inside a <p>", () => {
    const wrapper = mount(ElmParagraph, { slots: text("paragraph text") });
    const p = wrapper.find("p");
    expect(p.exists()).toBe(true);
    expect(p.text()).toContain("paragraph text");
  });

  it("color/backgroundColor flow into scoped CSS custom properties", () => {
    const wrapper = mount(ElmParagraph, {
      props: { color: "green", backgroundColor: "yellow" },
      slots: text("x"),
    });
    const p = wrapper.find("p").element as HTMLElement;
    expect(p.style.getPropertyValue("--elmethis-scoped-color")).toBe("green");
    expect(p.style.getPropertyValue("--elmethis-scoped-background-color")).toBe(
      "yellow",
    );
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmParagraph, {
      attrs: { class: "custom-class" },
      slots: text("x"),
    });
    expect(wrapper.find("p").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmParagraph", () => {
  it("renders the paragraph and text server-side", async () => {
    const html = (
      await renderToString(
        createSSRApp({ render: () => h(ElmParagraph, null, text("ssr-p")) }),
      )
    ).toLowerCase();
    expect(html).toContain("<p");
    expect(html).toContain("ssr-p");
  });
});
