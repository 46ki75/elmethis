import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmNotionCallout } from "./elm-notion-callout";

describe("[SSR] ElmNotionCallout", () => {
  it("renders its icon, variant, body, and native attributes", () => {
    const html = renderToString(() => (
      <ElmNotionCallout
        color="blue"
        variant="outlined"
        icon={{ kind: "image", src: "/icon.png", alt: "icon" }}
        class="custom-callout"
        data-callout="server"
      >
        server callout
      </ElmNotionCallout>
    ));

    expect(html).toContain("<div");
    expect(html).toContain("server callout");
    expect(html).toContain("custom-callout");
    expect(html).toContain("blue");
    expect(html).toContain("outlined");
    expect(html).toContain('src="/icon.png"');
    expect(html).toContain('alt="icon"');
    expect(html).toContain('data-callout="server"');
  });
});
