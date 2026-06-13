import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";
import { mdiCodeTags } from "@mdi/js";

import { ElmLanguageIcon } from "./elm-language-icon";

// Each language maps to a distinct brand SVG. We assert a marker that is unique
// to the expected sub-icon (a brand fill color, a gradient id) so a wrong
// mapping can't pass. The brand glyphs use viewBox "0 0 128 128"; the `file`
// fallback is an ElmMdiIcon with viewBox "0 0 24 24" + the mdiCodeTags path —
// a clean discriminator between "known language" and "fallback".

describe("[CSR] language → sub-icon mapping", () => {
  it("rust renders the Rust glyph (brand fill #a84f33)", () => {
    const wrapper = mount(ElmLanguageIcon, { props: { language: "rust" } });
    expect(wrapper.html().toLowerCase()).toContain('fill="#a84f33"');
  });

  it("typescript renders the TypeScript glyph (brand fill #007acc)", () => {
    const wrapper = mount(ElmLanguageIcon, {
      props: { language: "typescript" },
    });
    expect(wrapper.html().toLowerCase()).toContain('fill="#007acc"');
  });

  it("python renders the Python glyph (deviconPython gradient ids)", () => {
    const wrapper = mount(ElmLanguageIcon, { props: { language: "python" } });
    expect(wrapper.html()).toContain("deviconPython");
  });

  it("aliases normalize to the same glyph (rs → rust)", () => {
    const wrapper = mount(ElmLanguageIcon, { props: { language: "rs" } });
    expect(wrapper.html().toLowerCase()).toContain('fill="#a84f33"');
  });

  it("unknown language falls back to the file icon (mdiCodeTags)", () => {
    const wrapper = mount(ElmLanguageIcon, {
      props: { language: "totally-unknown-lang" },
    });
    const html = wrapper.html().toLowerCase();
    expect(html).toContain(`d="${mdiCodeTags.toLowerCase()}"`);
    // The MDI fallback uses the 24-grid viewBox, not the 128 brand grid.
    expect(html).toContain('viewbox="0 0 24 24"');
  });

  it("size prop reaches the rendered svg dimensions", () => {
    const wrapper = mount(ElmLanguageIcon, {
      props: { language: "rust", size: 48 },
    });
    const html = wrapper.html();
    expect(html).toContain('width="48"');
    expect(html).toContain('height="48"');
  });
});

describe("[SSR] ElmLanguageIcon", () => {
  it("rust renders its brand glyph in the SSR shell", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () => h(ElmLanguageIcon, { language: "rust" }),
        }),
      )
    ).toLowerCase();
    expect(html).toContain('fill="#a84f33"');
  });

  it("unknown language falls back to the file icon in SSR", async () => {
    const html = (
      await renderToString(
        createSSRApp({
          render: () => h(ElmLanguageIcon, { language: "nope" }),
        }),
      )
    ).toLowerCase();
    expect(html).toContain(`d="${mdiCodeTags.toLowerCase()}"`);
  });
});
