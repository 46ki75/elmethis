import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmFragmentIdentifier } from "./elm-fragment-identifier";

describe("[SSR] ElmFragmentIdentifier", () => {
  it("renders without accessing browser globals and keeps id private", () => {
    const html = renderToString(() => (
      <ElmFragmentIdentifier
        id="section"
        class="custom-fragment"
        aria-label="Section link"
        data-fragment="server"
      />
    ));

    expect(html).toContain("<span");
    expect(html).toContain("#");
    expect(html).toContain("custom-fragment");
    expect(html).toContain('aria-label="Section link"');
    expect(html).toContain('data-fragment="server"');
    expect(html).not.toContain('id="section"');
  });
});
