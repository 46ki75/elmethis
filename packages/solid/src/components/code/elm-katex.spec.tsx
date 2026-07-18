import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmKatex } from "./elm-katex";

describe("[CSR] ElmKatex", () => {
  it("renders KaTeX MathML for a valid expression", () => {
    const { container } = render(() => <ElmKatex expression="a^2 + b^2" />);

    expect(container.innerHTML).toContain("katex");
    expect(container.innerHTML).toContain("<math");
    expect(container.innerHTML).toContain("<msup");
    expect(container.innerHTML).not.toContain('display="block"');
  });

  it("reactively rerenders the expression and display mode", () => {
    const [expression, setExpression] = createSignal("x");
    const [block, setBlock] = createSignal(false);
    const { container } = render(() => (
      <ElmKatex expression={expression()} block={block()} />
    ));
    const root = container.firstElementChild!;

    expect(root.innerHTML).toContain("<mi>x</mi>");
    expect(root.innerHTML).not.toContain('display="block"');

    setExpression("y^2");
    setBlock(true);

    expect(root.innerHTML).toContain("<mi>y</mi>");
    expect(root.innerHTML).toContain("<msup");
    expect(root.innerHTML).toContain('display="block"');
    expect(root.className).toContain("elm-katex");
  });

  it("merges class and forwards native attributes and refs to the root", () => {
    let root: HTMLDivElement | undefined;
    const { getByTestId } = render(() => (
      <ElmKatex
        ref={(element) => {
          root = element;
        }}
        expression="x"
        class="custom-katex"
        data-testid="formula"
        aria-label="Formula"
      />
    ));

    const formula = getByTestId("formula");
    expect(formula).toBe(root);
    expect(formula).toHaveClass("custom-katex");
    expect(formula).toHaveAttribute("aria-label", "Formula");
  });
});
