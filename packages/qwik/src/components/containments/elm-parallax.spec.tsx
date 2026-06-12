import { createDOM } from "@qwik.dev/core/testing";
import { describe, expect, test } from "vitest";

import { ElmParallax } from "./elm-parallax";
import { renderToString } from "@qwik.dev/core/server";

// Parallax is scroll-driven: the layer transforms recompute from `window.scrollY`
// on the `window:onScroll$` handler. createDOM has no real scroll/layout, so we
// only smoke-render here — one layer per image, each backed by its background
// image. The scroll behavior itself is left to Storybook / manual QA.

const images = ["/a.png", "/b.png", "/c.png"];

describe("[CSR]", () => {
  test("Should render one layer per image", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmParallax images={images} />);

    const layers = screen.querySelectorAll("[class*='parallax']");
    // One watcher + one layer per image.
    expect(layers.length).toBeGreaterThanOrEqual(images.length);
    for (const src of images) {
      expect(screen.outerHTML).toContain(src);
    }
  });

  test("Should render with no images", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmParallax images={[]} />);
    expect(screen.outerHTML).toContain("parallax");
  });
});

describe("[SSR]", () => {
  test("Should render layers on the server", async () => {
    const renderResult = await renderToString(<ElmParallax images={images} />, {
      containerTagName: "div",
    });
    for (const src of images) {
      expect(renderResult.html).toContain(src);
    }
  });
});
