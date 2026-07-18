import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmRectangleWave } from "./elm-rectangle-wave";

describe("[SSR] ElmRectangleWave", () => {
  it("renders its presentational div and forwarded attributes", () => {
    const html = renderToString(() => (
      <ElmRectangleWave class="custom-wave" data-wave="rectangle" />
    ));

    expect(html).toContain("<div");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("custom-wave");
    expect(html).toContain('data-wave="rectangle"');
  });
});
