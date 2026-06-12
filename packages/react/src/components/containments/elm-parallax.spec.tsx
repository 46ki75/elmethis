import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmParallax } from "./elm-parallax";

// Parallax is scroll-driven: the layer transforms recompute from `window.scrollY`
// on a window scroll listener. The test DOM has no real scroll/layout, so we only
// smoke-render here — one layer per image, each backed by its background image.
// The scroll behavior itself is left to Storybook / manual QA.

const images = ["/a.png", "/b.png", "/c.png"];

describe("[CSR] ElmParallax", () => {
  it("renders one layer per image", () => {
    const { container } = render(<ElmParallax images={images} />);

    const layers = container.querySelectorAll("[class*='parallax']");
    // One watcher + one layer per image.
    expect(layers.length).toBeGreaterThanOrEqual(images.length);
    for (const src of images) {
      expect(container.innerHTML).toContain(src);
    }
  });

  it("renders with no images", () => {
    const { container } = render(<ElmParallax images={[]} />);
    expect(container.innerHTML).toContain("parallax");
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmParallax className="custom-class" images={[]} />,
    );
    expect(container.firstElementChild).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmParallax", () => {
  it("renders layers on the server", () => {
    const html = renderToStaticMarkup(<ElmParallax images={images} />);
    for (const src of images) {
      expect(html).toContain(src);
    }
  });
});
