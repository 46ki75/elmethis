import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";

import { ElmCodeBlock } from "./elm-code-block";

// ElmCodeBlock composes a language icon + caption + copy affordance (the
// `useClipboard` hook) + ElmShikiHighlighter. The real clipboard round-trip is
// already covered by use-clipboard.browser.spec.tsx — here we only assert the
// composition wiring at the CSR layer: code is highlighted, the language label
// shows, and both the language and copy icons are present.
const renderHTML = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML;
};

describe("[CSR] ElmCodeBlock — composition", () => {
  test("highlights the code via the embedded shiki highlighter", async () => {
    const html = await renderHTML(
      <ElmCodeBlock code={"let x = 1;"} language="rust" />,
    );
    // Proof ElmShikiHighlighter ran inside the block.
    expect(html).toContain("shiki");
    expect(html).toContain("--shiki-light");
  });

  test("falls back to the language as the caption when none is given", async () => {
    const html = await renderHTML(<ElmCodeBlock code={"x"} language="rust" />);
    // `{caption || language}` -> the language label is shown.
    expect(html).toContain("rust");
  });

  test("an explicit caption overrides the language label", async () => {
    const html = await renderHTML(
      <ElmCodeBlock code={"x"} language="python" caption="my-script.py" />,
    );
    expect(html).toContain("my-script.py");
    // The bare language is no longer rendered as the caption text node.
    expect(html).not.toContain(">python<");
  });

  test("renders the language icon and the copy affordance (two SVGs)", async () => {
    const html = await renderHTML(
      <ElmCodeBlock code={"x"} language="typescript" />,
    );
    // One <svg> for ElmLanguageIcon, one for the copy button's mdi icon.
    const svgCount = (html.match(/<svg/g) ?? []).length;
    expect(svgCount).toBeGreaterThanOrEqual(2);
    // The copy button carries the clipboard hook's host class (CSS Modules keep
    // the authored name as a substring).
    expect(html).toContain("use-clipboard");
  });

  test("forwards extra <figure> attributes (PropsOf<'figure'>) onto the host", async () => {
    const html = await renderHTML(
      <ElmCodeBlock code={"x"} language="txt" data-testid="block" />,
    );
    expect(html).toContain('data-testid="block"');
  });

  test("renders slot children alongside the caption", async () => {
    const html = await renderHTML(
      <ElmCodeBlock code={"x"} language="txt" caption="cap">
        extra-slot-text
      </ElmCodeBlock>,
    );
    expect(html).toContain("extra-slot-text");
  });
});
