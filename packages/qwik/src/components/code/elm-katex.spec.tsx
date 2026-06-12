import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";
import type { JSXOutput } from "@qwik.dev/core";

import { ElmKatex } from "./elm-katex";

// Render a JSX tree via createDOM and return its HTML. ElmKatex computes the
// KaTeX markup synchronously in a `useComputed$` and injects it with
// `dangerouslySetInnerHTML`, so the rendered output is available immediately.
const renderHTML = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML;
};

describe("[CSR] ElmKatex — rendered output", () => {
  test("renders KaTeX MathML markup for a valid expression", async () => {
    const html = await renderHTML(<ElmKatex expression="a^2 + b^2" />);
    // KaTeX wraps its output in `.katex` and (with output: "mathml") emits a
    // <math> element — proof the expression was actually compiled, not echoed.
    expect(html).toContain("katex");
    expect(html).toContain("<math");
    // The exponent superscript becomes an <msup>.
    expect(html).toContain("<msup");
  });

  test("inline mode (default) renders the MathML without display=block", async () => {
    const html = await renderHTML(<ElmKatex expression="x" />);
    // With output: "mathml", displayMode toggles the <math display="block">
    // attribute (not a `katex-display` wrapper). Inline mode omits it.
    expect(html).toContain("<math");
    expect(html).not.toContain('display="block"');
    // The component only applies its block CSS Module class in block mode.
    expect(html).not.toContain("_elm-katex_");
  });

  test("block mode sets display=block on the MathML and the block class", async () => {
    const html = await renderHTML(<ElmKatex expression="x" block />);
    // KaTeX (mathml output) marks block formulas via `display="block"`.
    expect(html).toContain('display="block"');
    // CSS Modules hash the class but keep the authored name as a substring.
    expect(html).toContain("_elm-katex_");
  });

  test("forwards extra div attributes (PropsOf<'div'>) onto the host", async () => {
    const html = await renderHTML(
      <ElmKatex expression="x" data-testid="formula" />,
    );
    expect(html).toContain('data-testid="formula"');
  });
});

describe("[SSR] ElmKatex", () => {
  test("server-renders the KaTeX MathML markup", async () => {
    const { html } = await renderToString(<ElmKatex expression="a^2 + b^2" />, {
      containerTagName: "div",
      symbolMapper: (symbolName, _mapper, parent) => [
        symbolName,
        parent ?? symbolName,
      ],
    });
    expect(html).toContain("katex");
    expect(html).toContain("<math");
    expect(html).toContain("<msup");
  });
});
