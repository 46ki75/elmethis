import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmMdiIcon } from "./elm-mdi-icon";

describe("[SSR] ElmMdiIcon", () => {
  it("renders its SVG shell, path, defaults, and forwarded attributes", () => {
    const html = renderToString(() => (
      <ElmMdiIcon d="M1 2L3 4" aria-label="Code" data-icon="mdi" />
    ));

    expect(html).toContain("<svg");
    expect(html).toContain('role="img"');
    expect(html).toContain('focusable="false"');
    expect(html).toContain('width="1em"');
    expect(html).toContain('aria-label="Code"');
    expect(html).toContain('data-icon="mdi"');
    expect(html).toContain('d="M1 2L3 4"');
  });
});
