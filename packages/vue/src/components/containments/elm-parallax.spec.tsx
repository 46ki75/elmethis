import { describe, it, expect } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmParallax } from "./elm-parallax";

// Parallax is scroll-driven: the layer transforms recompute from `window.scrollY`
// on a window scroll listener. The test DOM has no real scroll/layout, so we only
// smoke-render here — one layer per image, each backed by its background image.
// The scroll behavior itself is left to Storybook / manual QA.

const images = ["/a.png", "/b.png", "/c.png"];

describe("[CSR] ElmParallax", () => {
  it("renders one layer per image", () => {
    const wrapper = mount(ElmParallax, { props: { images } });

    const layers = wrapper.element.querySelectorAll("[class*='parallax']");
    // One watcher + one layer per image.
    expect(layers.length).toBeGreaterThanOrEqual(images.length);
    for (const src of images) {
      expect(wrapper.html()).toContain(src);
    }
  });

  it("renders with no images", () => {
    const wrapper = mount(ElmParallax, { props: { images: [] } });
    expect(wrapper.html()).toContain("parallax");
  });

  it("merges a passthrough class onto the root", () => {
    const wrapper = mount(ElmParallax, {
      props: { images: [] },
      attrs: { class: "custom-class" },
    });
    expect(wrapper.find("div").classes()).toContain("custom-class");
  });
});

describe("[SSR] ElmParallax", () => {
  it("renders layers on the server", async () => {
    const html = await renderToString(
      createSSRApp({ render: () => h(ElmParallax, { images }) }),
    );
    for (const src of images) {
      expect(html).toContain(src);
    }
  });
});
