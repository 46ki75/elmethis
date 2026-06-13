import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmBlockFallback } from "./elm-block-fallback";

// ElmBlockFallback composes the dot-loading icon with the rectangle-wave
// shimmer inside a sized root. It is a pure presentational composite: assert
// both children render and that the `height` prop reaches the scoped custom
// property.

describe("[CSR] ElmBlockFallback", () => {
  it("renders the dot-loading icon and the rectangle-wave", () => {
    const wrapper = mount(ElmBlockFallback);

    expect(wrapper.find('[class*="elm-block-fallback"]').exists()).toBe(true);
    expect(wrapper.find('[class*="elm-dot-loading-icon"]').exists()).toBe(true);
    expect(wrapper.find('[class*="elm-rectangle-wave"]').exists()).toBe(true);
  });

  it("default height feeds the --elmethis-scoped-height custom property", () => {
    const wrapper = mount(ElmBlockFallback);
    const root = wrapper.element as HTMLElement;
    expect(root.style.getPropertyValue("--elmethis-scoped-height")).toBe(
      "16rem",
    );
  });

  it("custom height overrides the default", () => {
    const wrapper = mount(ElmBlockFallback, { props: { height: "32rem" } });
    const root = wrapper.element as HTMLElement;
    expect(root.style.getPropertyValue("--elmethis-scoped-height")).toBe(
      "32rem",
    );
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmBlockFallback, {
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find('[class*="elm-block-fallback"]').classes()).toContain(
      "custom-class",
    );
  });
});

describe("[SSR] ElmBlockFallback", () => {
  it("server HTML includes both the loading icon and the shimmer", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(ElmBlockFallback) }),
    );
    expect(html).toContain("elm-dot-loading-icon");
    expect(html).toContain("elm-rectangle-wave");
  });
});
