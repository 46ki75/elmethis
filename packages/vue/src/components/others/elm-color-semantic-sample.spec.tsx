import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmColorSemanticSample } from "./elm-color-semantic-sample";

// The semantic sample renders the same token set twice — once per forced theme
// panel (light + dark) — so every `data-theme`/`color-scheme` pair resolves its
// own `light-dark()` values. We smoke-render and assert both panels mount and
// representative semantic tokens are present as copy targets.

describe("[CSR] ElmColorSemanticSample", () => {
  it("renders both the light and dark theme panels", () => {
    const wrapper = mount(ElmColorSemanticSample);
    expect(wrapper.find('[data-theme="light"]').exists()).toBe(true);
    expect(wrapper.find('[data-theme="dark"]').exists()).toBe(true);
  });

  it("stamps representative semantic tokens as copy targets", () => {
    const wrapper = mount(ElmColorSemanticSample);
    expect(
      wrapper
        .find('[data-copy-token="--elmethis-color-surface-base"]')
        .exists(),
    ).toBe(true);
    expect(
      wrapper.find('[data-copy-token="--elmethis-color-primary"]').exists(),
    ).toBe(true);
    expect(wrapper.html()).toContain("Surface");
    expect(wrapper.html()).toContain("Accent");
  });

  it("forwards a custom class onto the root", () => {
    const wrapper = mount(ElmColorSemanticSample, {
      attrs: { class: "custom-root" },
    });
    expect(
      wrapper.find('[class*="elm-color-semantic-sample"]').classes(),
    ).toContain("custom-root");
  });
});

describe("[SSR] ElmColorSemanticSample", () => {
  it("server HTML includes both theme panels", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(ElmColorSemanticSample) }),
    );
    expect(html).toContain('data-theme="light"');
    expect(html).toContain('data-theme="dark"');
  });
});
