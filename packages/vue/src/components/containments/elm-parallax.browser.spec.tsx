import { render } from "vitest-browser-vue";
import { describe, expect, it } from "vitest";

import { ElmParallax } from "./elm-parallax";

describe("[Browser] ElmParallax", () => {
  it("contains negative layers above the document canvas", () => {
    const image =
      "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3C/svg%3E";
    const screen = render(ElmParallax, { props: { images: [image] } });
    const root = screen.container.firstElementChild as HTMLElement;
    const layer = root.lastElementChild as HTMLElement;

    expect(getComputedStyle(root).isolation).toBe("isolate");
    expect(getComputedStyle(root).pointerEvents).toBe("none");
    expect(layer?.style.backgroundImage).toContain(image);
  });
});
