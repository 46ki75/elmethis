import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmParallax } from "./elm-parallax";

describe("[CSR] ElmParallax", () => {
  it("renders one layer per image and forwards root attributes", () => {
    const rendered = render(() => (
      <ElmParallax
        images={["/a.png", "/b.png"]}
        class="custom-parallax"
        data-testid="parallax"
      />
    ));

    expect(rendered.getByTestId("parallax")).toHaveClass("custom-parallax");
    expect(
      rendered.container.querySelectorAll("[aria-hidden='true']"),
    ).toHaveLength(2);
    expect(rendered.container.innerHTML).toContain("/a.png");
    expect(rendered.container.innerHTML).toContain("/b.png");
  });

  it("reactively updates image layers", () => {
    const [images, setImages] = createSignal(["/first.png"]);
    const rendered = render(() => <ElmParallax images={images()} />);

    setImages(["/second.png", "/third.png"]);

    expect(
      rendered.container.querySelectorAll("[aria-hidden='true']"),
    ).toHaveLength(2);
    expect(rendered.container.innerHTML).not.toContain("/first.png");
    expect(rendered.container.innerHTML).toContain("/third.png");
  });

  it("initializes transforms and removes its listener on cleanup", () => {
    let frame: FrameRequestCallback | undefined;
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockImplementation((callback) => {
        frame = callback;
        return 1;
      });
    const scrollY = vi.spyOn(window, "scrollY", "get").mockReturnValue(500);
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    const rendered = render(() => <ElmParallax images={["/layer.png"]} />);
    const layer = rendered.container.querySelector(
      "[aria-hidden='true']",
    ) as HTMLElement;

    expect(frame).toBeDefined();
    frame?.(0);
    expect(layer.style.transform).toBe("scale(1.2) translateY(0.5%)");

    rendered.unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
    requestAnimationFrame.mockRestore();
    scrollY.mockRestore();
  });

  it("cancels a pending animation frame on cleanup", () => {
    const requestAnimationFrame = vi
      .spyOn(window, "requestAnimationFrame")
      .mockReturnValue(42);
    const cancelAnimationFrame = vi.spyOn(window, "cancelAnimationFrame");
    const rendered = render(() => <ElmParallax images={["/layer.png"]} />);

    rendered.unmount();

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
    const [images, setImages] = createSignal(["/first.png"]);
    const rendered = render(() => <ElmParallax images={images()} />);

    frame?.(0);
    setImages(["/first.png", "/second.png"]);

    const layers = rendered.container.querySelectorAll<HTMLElement>(
      "[aria-hidden='true']",
    );
    expect(layers[1]?.style.transform).toBe("scale(1.2) translateY(0.25%)");
    rendered.unmount();
    requestAnimationFrame.mockRestore();
    scrollY.mockRestore();
  });
});
