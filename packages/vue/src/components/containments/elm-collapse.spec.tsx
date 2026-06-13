import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmCollapse } from "./elm-collapse";

describe("[CSR] ElmCollapse", () => {
  it("renders children inside the inner wrapper", () => {
    const wrapper = mount(ElmCollapse, {
      slots: { default: () => h("span", "Content") },
    });
    expect(wrapper.text()).toContain("Content");
  });

  it("renders children with isOpen={false}", () => {
    const wrapper = mount(ElmCollapse, {
      props: { isOpen: false },
      slots: { default: () => "With Fragment" },
    });
    expect(wrapper.text()).toContain("With Fragment");
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmCollapse, {
      attrs: { class: "custom-class" },
      slots: { default: () => "x" },
    });
    expect(wrapper.find("div").classes()).toContain("custom-class");
  });

  it("transitionTimingFunction flows into a scoped CSS custom property", () => {
    const wrapper = mount(ElmCollapse, {
      props: { transitionTimingFunction: "linear" },
      slots: { default: () => "x" },
    });
    const root = wrapper.element as HTMLElement;
    expect(
      root.style.getPropertyValue(
        "--elmethis-scoped-transition-timing-function",
      ),
    ).toBe("linear");
  });
});

describe("[SSR] ElmCollapse", () => {
  it("renders children server-side", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ElmCollapse, null, { default: () => h("span", "Content") }),
      }),
    );
    expect(html).toContain("Content");
  });
});
