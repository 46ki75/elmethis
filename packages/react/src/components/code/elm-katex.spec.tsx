import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmKatex } from "./elm-katex";

describe("[CSR] ElmKatex — rendered output", () => {
  test("renders KaTeX MathML markup for a valid expression", () => {
    const { container } = render(<ElmKatex expression="a^2 + b^2" />);
    const html = container.innerHTML;
    // KaTeX wraps its output in `.katex` and (with output: "mathml") emits a
    // <math> element — proof the expression was actually compiled, not echoed.
    expect(html).toContain("katex");
    expect(html).toContain("<math");
    // The exponent superscript becomes an <msup>.
    expect(html).toContain("<msup");
  });

  test("inline mode (default) renders the MathML without display=block", () => {
    const { container } = render(<ElmKatex expression="x" />);
    const html = container.innerHTML;
    // With output: "mathml", displayMode toggles the <math display="block">
    // attribute (not a `katex-display` wrapper). Inline mode omits it.
    expect(html).toContain("<math");
    expect(html).not.toContain('display="block"');
    // The component only applies its block CSS Module class in block mode.
    expect(html).not.toContain("_elm-katex_");
  });

  test("block mode sets display=block on the MathML and the block class", () => {
    const { container } = render(<ElmKatex expression="x" block />);
    const html = container.innerHTML;
    // KaTeX (mathml output) marks block formulas via `display="block"`.
    expect(html).toContain('display="block"');
    // CSS Modules hash the class but keep the authored name as a substring.
    expect(html).toContain("_elm-katex_");
  });

  test("forwards extra div attributes (ComponentPropsWithoutRef<'div'>) onto the host", () => {
    const { container } = render(
      <ElmKatex expression="x" data-testid="formula" />,
    );
    expect(container.innerHTML).toContain('data-testid="formula"');
  });
});

describe("[SSR] ElmKatex", () => {
  test("server-renders the KaTeX MathML markup", () => {
    const html = renderToStaticMarkup(<ElmKatex expression="a^2 + b^2" />);
    expect(html).toContain("katex");
    expect(html).toContain("<math");
    expect(html).toContain("<msup");
  });
});
