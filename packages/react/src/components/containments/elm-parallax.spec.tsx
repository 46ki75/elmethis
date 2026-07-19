import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmParallax } from "./elm-parallax";

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

  it("initializes the layers from the current scroll position", () => {
    let frame: FrameRequestCallback | undefined;
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        frame = callback;
        return 1;
      });
    const scrollY = vi.spyOn(window, "scrollY", "get").mockReturnValue(500);
    const { container, unmount } = render(
      <ElmParallax images={["/layer.png"]} />,
    );

    expect(frame).toBeDefined();
    frame?.(0);
    expect(
      container.querySelector<HTMLElement>("[aria-hidden='true']")?.style
        .transform,
    ).toBe("scale(1.2) translateY(0.5%)");

    unmount();
    requestAnimationFrame.mockRestore();
    scrollY.mockRestore();
  });

  it("cancels a pending animation frame on cleanup", () => {
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockReturnValue(42);
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");
    const { unmount } = render(<ElmParallax images={["/layer.png"]} />);

    unmount();

    expect(cancelAnimationFrame).toHaveBeenCalledWith(42);
    requestAnimationFrame.mockRestore();
    cancelAnimationFrame.mockRestore();
  });

  it("applies the current offset to newly added layers", () => {
    let frame: FrameRequestCallback | undefined;
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        frame = callback;
        return 1;
      });
    const scrollY = vi.spyOn(window, "scrollY", "get").mockReturnValue(500);
    const rendered = render(<ElmParallax images={["/first.png"]} />);

    frame?.(0);
    rendered.rerender(<ElmParallax images={["/first.png", "/second.png"]} />);

    const layers = rendered.container.querySelectorAll<HTMLElement>(
      "[aria-hidden='true']",
    );
    expect(layers[1]?.style.transform).toBe("scale(1.2) translateY(0.25%)");
    rendered.unmount();
    requestAnimationFrame.mockRestore();
    scrollY.mockRestore();
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
