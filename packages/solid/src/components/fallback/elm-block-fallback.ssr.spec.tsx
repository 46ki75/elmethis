import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmBlockFallback } from "./elm-block-fallback";

describe("[SSR] ElmBlockFallback", () => {
  it("renders both loaders, height, and forwarded attributes", () => {
    const html = renderToString(() => (
      <ElmBlockFallback height="20rem" data-fallback="block" />
    ));

    expect(html.match(/aria-hidden="true"/g)).toHaveLength(4);
    expect(html).toContain("--elmethis-scoped-height:20rem");
    expect(html).toContain('data-fallback="block"');
  });
});
