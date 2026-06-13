import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmColorPrimitiveSample } from "./elm-color-primitive-sample";

// Smoke-level coverage: the sample renders a swatch grid of `--elmethis-
// primitive-color-*` tokens plus a copy-mode toggle. We assert representative
// swatches are stamped with their `data-copy-token` (the delegated click
// handler keys off this attribute) and that the toggle reflects the default
// "variable name" mode. Clipboard / hex-resolution behavior needs real
// `navigator.clipboard` + computed styles.

describe("[CSR] ElmColorPrimitiveSample", () => {
  it("renders swatches stamped with their primitive token names", () => {
    const wrapper = mount(ElmColorPrimitiveSample);
    expect(
      wrapper
        .find('[data-copy-token="--elmethis-primitive-color-red-500"]')
        .exists(),
    ).toBe(true);
    expect(
      wrapper
        .find('[data-copy-token="--elmethis-primitive-color-slate-700"]')
        .exists(),
    ).toBe(true);
    expect(wrapper.text()).toContain("red");
  });

  it("defaults the copy-mode toggle to variable-name mode", () => {
    const wrapper = mount(ElmColorPrimitiveSample);
    expect(wrapper.text()).toContain("variable name");
  });

  it("forwards a custom class onto the root", () => {
    const wrapper = mount(ElmColorPrimitiveSample, {
      attrs: { class: "custom-root" },
    });
    expect(
      wrapper.find('[class*="elm-color-primitive-sample"]').classes(),
    ).toContain("custom-root");
  });
});

describe("[SSR] ElmColorPrimitiveSample", () => {
  it("server HTML includes the primitive swatch tokens", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(ElmColorPrimitiveSample) }),
    );
    expect(html).toContain("--elmethis-primitive-color-blue-500");
  });
});
