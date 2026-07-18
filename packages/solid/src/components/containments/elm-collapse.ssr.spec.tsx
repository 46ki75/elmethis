import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmCollapse } from "./elm-collapse";

describe("[SSR] ElmCollapse", () => {
  it("renders children, initial state, styles, and forwarded props server-side", () => {
    const html = renderToString(() => (
      <ElmCollapse
        isOpen={false}
        direction="both"
        transitionTimingFunction="linear"
        class="server-collapse"
        data-collapse="server"
      >
        <span>Server content</span>
      </ElmCollapse>
    ));

    expect(html).toContain("Server content");
    expect(html).toContain("server-collapse");
    expect(html).toContain('data-collapse="server"');
    expect(html).toContain(
      "--elmethis-scoped-transition-timing-function:linear",
    );
    expect(html).not.toContain(" isOpen=");
    expect(html).not.toContain(" direction=");
  });
});
