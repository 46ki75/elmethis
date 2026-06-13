import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmTooltip } from "./elm-tooltip";

// Hover behavior lives in elm-tooltip.browser.spec.tsx: the mouseover handler
// reads `getBoundingClientRect()` / `window.innerWidth` for positioning, which
// happy-dom does not implement faithfully. The unit layer covers the static
// render of both the trigger (original slot) and the tooltip content.

describe("[CSR] ElmTooltip", () => {
  it("renders both the trigger and the tooltip content", () => {
    const wrapper = mount(ElmTooltip, {
      slots: {
        original: () => h("span", "trigger"),
        tooltip: () => h("span", "tip body"),
      },
    });
    expect(wrapper.text()).toContain("trigger");
    expect(wrapper.text()).toContain("tip body");
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmTooltip, {
      attrs: { class: "custom-class" },
      slots: { original: () => "x", tooltip: () => "y" },
    });
    expect(wrapper.find("span").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmTooltip", () => {
  it("renders both slots server-side", async () => {
    const html = await renderToString(
      createSSRApp({
        render: () =>
          h(ElmTooltip, null, {
            original: () => "trigger",
            tooltip: () => "tip body",
          }),
      }),
    );
    expect(html).toContain("trigger");
    expect(html).toContain("tip body");
  });
});
