import { describe, expect, test } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmCodeBlock } from "./elm-code-block";

// ElmCodeBlock composes a language icon + caption + copy affordance (the
// `useClipboard` hook) + ElmShikiHighlighter. The real clipboard round-trip is
// already covered by use-clipboard.browser.spec.tsx, and the highlight pipeline
// by elm-shiki-highlighter.spec.tsx — here we only assert the composition
// wiring: code is highlighted, the language label shows, and both the language
// and copy icons are present.

describe("[CSR] ElmCodeBlock — composition", () => {
  test("highlights the code via the embedded shiki highlighter", async () => {
    const { container } = render(
      <ElmCodeBlock code={"let x = 1;"} language="rust" />,
    );
    // Shiki highlights asynchronously inside ElmShikiHighlighter's effect.
    await waitFor(() => expect(container.innerHTML).toContain("--shiki-light"));
    // Proof ElmShikiHighlighter ran inside the block.
    expect(container.innerHTML).toContain("shiki");
  });

  test("falls back to the language as the caption when none is given", () => {
    const { container } = render(<ElmCodeBlock code={"x"} language="rust" />);
    // `{caption || language}` -> the language label is shown.
    expect(container.textContent).toContain("rust");
  });

  test("an explicit caption overrides the language label", () => {
    const { container } = render(
      <ElmCodeBlock code={"x"} language="python" caption="my-script.py" />,
    );
    expect(container.textContent).toContain("my-script.py");
    // The bare language is no longer rendered as the caption text node.
    expect(container.innerHTML).not.toContain(">python<");
  });

  test("renders the language icon and the copy affordance (two SVGs)", () => {
    const { container } = render(
      <ElmCodeBlock code={"x"} language="typescript" />,
    );
    // One <svg> for ElmLanguageIcon, one for the copy button's mdi icon.
    expect(container.querySelectorAll("svg").length).toBeGreaterThanOrEqual(2);
    // The copy button carries the clipboard hook's host class (CSS Modules keep
    // the authored name as a substring).
    expect(container.innerHTML).toContain("use-clipboard");
  });

  test("forwards extra <figure> attributes onto the host", () => {
    const { container } = render(
      <ElmCodeBlock code={"x"} language="txt" data-testid="block" />,
    );
    expect(container.querySelector("figure")).toHaveAttribute(
      "data-testid",
      "block",
    );
  });

  test("renders children alongside the caption", () => {
    const { container } = render(
      <ElmCodeBlock code={"x"} language="txt" caption="cap">
        extra-slot-text
      </ElmCodeBlock>,
    );
    expect(container.textContent).toContain("extra-slot-text");
    expect(container.textContent).toContain("cap");
  });
});

describe("[SSR] ElmCodeBlock", () => {
  test("renders the host <figure> and caption server-side", () => {
    const html = renderToStaticMarkup(
      <ElmCodeBlock
        code={"let x = 1;"}
        language="rust"
        caption="src/main.rs"
      />,
    ).toLowerCase();
    expect(html).toContain("<figure");
    expect(html).toContain("src/main.rs");
  });
});
