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

  it("updates transforms on scroll and removes its listener on cleanup", () => {
    const scrollY = vi.spyOn(window, "scrollY", "get").mockReturnValue(500);
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    const rendered = render(() => <ElmParallax images={["/layer.png"]} />);
    const layer = rendered.container.querySelector(
      "[aria-hidden='true']",
    ) as HTMLElement;

    window.dispatchEvent(new Event("scroll"));
    expect(layer.style.transform).toBe("scale(1.2) translateY(0.5%)");

    rendered.unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
    scrollY.mockRestore();
  });
});
