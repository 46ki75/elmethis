import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmCallout } from "./elm-callout";

describe("[SSR] ElmCallout", () => {
  it("renders its type, icon, content, and native attributes", () => {
    const html = renderToString(() => (
      <ElmCallout
        type="tip"
        class="custom-callout"
        aria-label="Tip"
        data-callout="server"
      >
        server callout
      </ElmCallout>
    ));

    expect(html).toContain("<aside");
    expect(html).toContain("tip");
    expect(html).toContain("server callout");
    expect(html).toContain("custom-callout");
    expect(html).toContain('aria-label="Tip"');
    expect(html).toContain('data-callout="server"');
    expect(html).toContain("<svg");
    expect(html).not.toContain(" type=");
  });
});
