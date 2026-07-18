import { render } from "@solidjs/testing-library";
import { describe, expect, it, vi } from "vitest";

import { ElmParallax } from "./elm-parallax";

describe("[Browser] ElmParallax", () => {
  it("renders data URLs above the document canvas", () => {
    const image =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E";
    const rendered = render(() => <ElmParallax images={[image]} />);
    const root = rendered.container.firstElementChild as HTMLElement;
    const layer = root.querySelector<HTMLElement>("[aria-hidden='true']");

    expect(getComputedStyle(root).isolation).toBe("isolate");
    expect(getComputedStyle(root).pointerEvents).toBe("none");
    expect(layer?.style.backgroundImage).toContain(image);
  });

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
