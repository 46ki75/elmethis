import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmParallax } from "./elm-parallax";

describe("[SSR] ElmParallax", () => {
  it("renders deterministic layers without browser globals", () => {
    const html = renderToString(() => (
      <ElmParallax
        images={["/a.png", "/b.png"]}
        class="server-parallax"
        aria-label="Background"
      />
    ));

    expect(html).toContain("server-parallax");
    expect(html).toContain('aria-label="Background"');
    expect(html).toContain("/a.png");
    expect(html).toContain("/b.png");
    expect(html).toContain("translateY(0%)");
  });
});
