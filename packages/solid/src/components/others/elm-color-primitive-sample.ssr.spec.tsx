import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmColorPrimitiveSample } from "./elm-color-primitive-sample";

describe("[SSR] ElmColorPrimitiveSample", () => {
  it("renders primitive tokens and forwarded root props without browser APIs", () => {
    const html = renderToString(() => (
      <ElmColorPrimitiveSample
        class="server-sample"
        data-sample="primitive"
        style={{ width: "20rem" }}
      />
    ));

    expect(html).toContain("--elmethis-primitive-color-blue-500");
    expect(html).toContain("server-sample");
    expect(html).toContain('data-sample="primitive"');
    expect(html).toContain("width:20rem");
    expect(html).toContain("Copy: ");
    expect(html).toContain("variable name");
  });
});
