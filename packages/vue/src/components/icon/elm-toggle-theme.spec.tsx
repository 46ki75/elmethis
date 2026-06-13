import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmToggleTheme } from "./elm-toggle-theme";

// ElmToggleTheme drives useElmethisTheme — real theme toggling (color-scheme /
// localStorage / cross-tab) is covered by use-elmethis-theme's own browser
// spec. Here we only assert the toggle control renders and respects the size
// prop. The unit DOM can't fake a real color-scheme, so we stick to
// render/structure assertions.

describe("[CSR] ElmToggleTheme", () => {
  it("renders the svg toggle control", () => {
    const wrapper = mount(ElmToggleTheme);
    expect(wrapper.find("svg").exists()).toBe(true);
  });

  it("defaults the svg size to 2rem", () => {
    const wrapper = mount(ElmToggleTheme);
    const svg = wrapper.find("svg");
    expect(svg.attributes("width")).toBe("2rem");
    expect(svg.attributes("height")).toBe("2rem");
  });

  it("size prop drives the svg width and height", () => {
    const wrapper = mount(ElmToggleTheme, { props: { size: "3rem" } });
    const svg = wrapper.find("svg");
    expect(svg.attributes("width")).toBe("3rem");
    expect(svg.attributes("height")).toBe("3rem");
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmToggleTheme, {
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find("svg").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmToggleTheme", () => {
  it("renders the svg server-side", async () => {
    const html = (
      await renderToString(createSSRApp({ render: () => h(ElmToggleTheme) }))
    ).toLowerCase();
    expect(html).toContain("<svg");
    expect(html).toContain('width="2rem"');
  });
});
