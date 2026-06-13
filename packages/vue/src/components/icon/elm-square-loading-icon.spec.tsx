import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmSquareLoadingIcon } from "./elm-square-loading-icon";

// The grid renders `dimensions * dimensions` square cells, each carrying a
// staggered `--elmethis-scoped-delay`. We count the per-square delay var to
// assert the grid size without depending on the hashed CSS-module class name.
const countDelays = (html: string) =>
  (html.match(/--elmethis-scoped-delay:/g) ?? []).length;

describe("[CSR] ElmSquareLoadingIcon", () => {
  it("default dimensions=4 renders a 4x4 grid (16 squares)", () => {
    const wrapper = mount(ElmSquareLoadingIcon);
    expect(countDelays(wrapper.html())).toBe(16);
  });

  it("dimensions prop scales the grid (3 → 9 squares)", () => {
    const wrapper = mount(ElmSquareLoadingIcon, { props: { dimensions: 3 } });
    expect(countDelays(wrapper.html())).toBe(9);
  });

  it("size + dimensions feed the scoped CSS vars on the host", () => {
    const wrapper = mount(ElmSquareLoadingIcon, {
      props: { size: "5rem", dimensions: 2 },
    });
    const host = wrapper.find("span").element as HTMLElement;
    expect(host.style.getPropertyValue("--elmethis-scoped-size")).toBe("5rem");
    expect(host.style.getPropertyValue("--elmethis-scoped-dimensions")).toBe(
      "2",
    );
    // Duration is fixed (1200ms) regardless of dimensions.
    expect(host.style.getPropertyValue("--elmethis-scoped-duration")).toBe(
      "1200ms",
    );
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmSquareLoadingIcon, {
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find("span").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmSquareLoadingIcon", () => {
  it("renders the full grid in the SSR shell", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(ElmSquareLoadingIcon) }),
    );
    expect(countDelays(html)).toBe(16);
  });
});
