import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmPageTop } from "./elm-page-top";

describe("[SSR] ElmPageTop", () => {
  it("renders a hidden-by-style accessible control without browser globals", () => {
    const html = renderToString(() => (
      <ElmPageTop position="left" class="server-page-top" />
    ));

    expect(html).toContain("<nav");
    expect(html).toContain('role="button"');
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('tabindex="-1"');
    expect(html).toContain("Back to Top");
    expect(html).toContain("server-page-top");
    expect(html).toContain("left:0");
    expect(html).toContain("right:auto");
  });
});
