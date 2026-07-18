import { render } from "vitest-browser-react";
import { describe, expect, it } from "vitest";

import { ElmParallax } from "./elm-parallax";

describe("[Browser] ElmParallax", () => {
  it("keeps background layers above the document canvas", async () => {
    const rendered = await render(<ElmParallax images={["/layer.png"]} />);
    const root = rendered.container.firstElementChild as HTMLElement;

    expect(getComputedStyle(root).isolation).toBe("isolate");
    expect(getComputedStyle(root).pointerEvents).toBe("none");
  });
});
