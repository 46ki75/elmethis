import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmSquareLoadingIcon } from "./elm-square-loading-icon";

describe("[SSR] ElmSquareLoadingIcon", () => {
  it("renders a complete grid and scoped host values", () => {
    const html = renderToString(() => (
      <ElmSquareLoadingIcon dimensions={3} size="5rem" data-grid="square" />
    ));

    expect(html.match(/--elmethis-scoped-delay:/g)).toHaveLength(9);
    expect(html).toContain("--elmethis-scoped-size:5rem");
    expect(html).toContain("--elmethis-scoped-dimensions:3");
    expect(html).toContain('data-grid="square"');
  });
});
