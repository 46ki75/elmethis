import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmDivider } from "./elm-divider";

describe("[SSR] ElmDivider", () => {
  it("renders an <hr> and forwarded attributes server-side", () => {
    const html = renderToString(() => (
      <ElmDivider aria-label="Section break" class="custom-divider" />
    ));

    expect(html).toContain("<hr");
    expect(html).toContain('aria-label="Section break"');
    expect(html).toContain("custom-divider");
  });
});
