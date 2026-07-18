import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmKatex } from "./elm-katex";

describe("[SSR] ElmKatex", () => {
  it("renders KaTeX MathML and forwarded attributes server-side", () => {
    const html = renderToString(() => (
      <ElmKatex
        expression="a^2 + b^2"
        block
        class="custom-katex"
        data-formula="pythagorean"
      />
    ));

    expect(html).toContain("katex");
    expect(html).toContain("<math");
    expect(html).toContain("<msup");
    expect(html).toContain('display="block"');
    expect(html).toContain("custom-katex");
    expect(html).toContain('data-formula="pythagorean"');
  });
});
