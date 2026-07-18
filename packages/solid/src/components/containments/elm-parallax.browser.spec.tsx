import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";

import { ElmParallax } from "./elm-parallax";

describe("[Browser] ElmParallax", () => {
  it("tracks real window scrolling and cleans up the listener", async () => {
    const removeEventListener = vi.spyOn(window, "removeEventListener");
    const rendered = render(() => (
      <div style={{ height: "2000px" }}>
        <ElmParallax images={["/layer.png", "/second.png"]} />
      </div>
    ));
    const layers = rendered.container.querySelectorAll<HTMLElement>(
      "[aria-hidden='true']",
    );

    window.scrollTo(0, 320);
    await vi.waitFor(() => expect(window.scrollY).toBeGreaterThan(100));
    await vi.waitFor(() =>
      expect(layers[0]?.style.transform).not.toBe("scale(1.2) translateY(0%)"),
    );
    expect(layers[0]?.style.transform).not.toBe(layers[1]?.style.transform);

    rendered.unmount();
    expect(removeEventListener).toHaveBeenCalledWith(
      "scroll",
      expect.any(Function),
    );
    window.scrollTo(0, 0);
  });
});
