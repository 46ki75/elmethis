import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmDotLoadingIcon } from "./elm-dot-loading-icon";

describe("[SSR] ElmDotLoadingIcon", () => {
  it("renders three decorative dots and the default size", () => {
    const html = renderToString(() => (
      <ElmDotLoadingIcon aria-label="Loading" />
    ));

    expect(html.match(/aria-hidden="true"/g)).toHaveLength(3);
    expect(html).toContain("--elmethis-scoped-size:4em");
    expect(html).toContain('aria-label="Loading"');
  });
});
