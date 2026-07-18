import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmColorSemanticSample } from "./elm-color-semantic-sample";

describe("[SSR] ElmColorSemanticSample", () => {
  it("renders both theme panels and forwarded props without browser APIs", () => {
    const html = renderToString(() => (
      <ElmColorSemanticSample class="server-sample" data-sample="semantic" />
    ));

    expect(html).toContain('data-theme="light"');
    expect(html).toContain('data-theme="dark"');
    expect(html).toContain("--elmethis-color-primary");
    expect(html).toContain("server-sample");
    expect(html).toContain('data-sample="semantic"');
  });
});
