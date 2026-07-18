import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmInlineIcon } from "./elm-inline-icon";

describe("[SSR] ElmInlineIcon", () => {
  it("renders its image and forwarded root attributes", () => {
    const html = renderToString(() => (
      <ElmInlineIcon
        src="https://example.com/icon.svg"
        alt="my icon"
        class="custom-icon"
        data-icon="inline"
      />
    ));

    expect(html).toContain("<span");
    expect(html).toContain("<img");
    expect(html).toContain('src="https://example.com/icon.svg"');
    expect(html).toContain('alt="my icon"');
    expect(html).toContain('width="16"');
    expect(html).toContain('height="16"');
    expect(html).toContain("custom-icon");
    expect(html).toContain('data-icon="inline"');
  });
});
