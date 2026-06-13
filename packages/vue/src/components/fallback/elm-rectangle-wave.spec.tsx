import { describe, expect, it } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmRectangleWave } from "./elm-rectangle-wave";

// ElmRectangleWave is the shimmer placeholder: a single presentational `<div>`
// that is `aria-hidden` and forwards native `<div>` attributes. No state, no
// effects — a pure CSR + SSR render check is enough.

describe("[CSR] ElmRectangleWave", () => {
  it("renders an aria-hidden div carrying the root class", () => {
    const wrapper = mount(ElmRectangleWave);

    const wave = wrapper.find("div");
    expect(wave.exists()).toBe(true);
    expect(wave.attributes("aria-hidden")).toBe("true");
    expect(wave.classes().join(" ")).toMatch(/elm-rectangle-wave/);
  });

  it("forwards native div attributes (class merge + style)", () => {
    const wrapper = mount(ElmRectangleWave, {
      attrs: { class: "extra", style: { width: "10rem" } },
    });

    const wave = wrapper.find("div");
    // The authored root class survives alongside the consumer-supplied one.
    expect(wave.classes().join(" ")).toMatch(/elm-rectangle-wave/);
    expect(wave.classes()).toContain("extra");
    expect(wave.attributes("style")).toContain("width: 10rem");
  });
});

describe("[SSR] ElmRectangleWave", () => {
  it("server HTML emits the aria-hidden placeholder div", async () => {
    const html = (
      await renderToString(createSSRApp({ render: () => h(ElmRectangleWave) }))
    ).toLowerCase();
    expect(html).toContain("<div");
    expect(html).toContain('aria-hidden="true"');
  });
});
