import { describe, it, expect, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createSSRApp, h } from "vue";
import { renderToString } from "vue/server-renderer";

import { ElmParallax } from "./elm-parallax";

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

  it("initializes the layers from the current scroll position", () => {
    let frame: FrameRequestCallback | undefined;
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        frame = callback;
        return 1;
      });
    const scrollY = vi.spyOn(window, "scrollY", "get").mockReturnValue(500);
    const wrapper = mount(ElmParallax, { props: { images: ["/layer.png"] } });

    expect(frame).toBeDefined();
    frame?.(0);
    const layer = wrapper.element.querySelector(
      "[aria-hidden='true']",
    ) as HTMLElement | null;
    expect(layer?.style.transform).toBe("scale(1.2) translateY(0.5%)");

    wrapper.unmount();
    requestAnimationFrame.mockRestore();
    scrollY.mockRestore();
  });

  it("cancels a pending animation frame on cleanup", () => {
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockReturnValue(42);
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");
    const wrapper = mount(ElmParallax, {
      props: { images: ["/layer.png"] },
    });

    wrapper.unmount();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
    requestAnimationFrame.mockRestore();
    cancelAnimationFrame.mockRestore();
  });

  it("applies the current offset to newly added layers", async () => {
    let frame: FrameRequestCallback | undefined;
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        frame = callback;
        return 1;
      });
    const scrollY = vi.spyOn(window, "scrollY", "get").mockReturnValue(500);
    const wrapper = mount(ElmParallax, {
      props: { images: ["/first.png"] },
    });

    frame?.(0);
    await wrapper.setProps({ images: ["/first.png", "/second.png"] });

    const layers = wrapper.element.querySelectorAll(
      "[aria-hidden='true']",
    ) as NodeListOf<HTMLElement>;
    expect(layers[1]?.style.transform).toBe("scale(1.2) translateY(0.25%)");
    wrapper.unmount();
    requestAnimationFrame.mockRestore();
    scrollY.mockRestore();
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
