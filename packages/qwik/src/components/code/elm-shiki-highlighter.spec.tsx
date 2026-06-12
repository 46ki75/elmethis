import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

// Shiki highlights asynchronously inside a `useTask$` (`codeToHtml`). createDOM
// awaits component tasks, so by the time `render()` resolves the highlighted
// markup is already injected via `dangerouslySetInnerHTML` — no browser layer
// needed. The component requests `defaultColor: false`, so each token carries
// `--shiki-light*` / `--shiki-dark*` custom properties (resolved natively with
// light-dark() in CSS); asserting those proves the real highlight pipeline ran.
const renderHTML = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML;
};

describe("[CSR] ElmShikiHighlighter — highlighted output", () => {
  test("emits shiki token markup with dual-theme custom properties", async () => {
    const html = await renderHTML(
      <ElmShikiHighlighter code={"let x = 1;"} language="rust" />,
    );
    // The real shiki output wraps tokens in `.shiki` and tokenizes into spans.
    expect(html).toContain("shiki");
    expect(html).toContain('class="line"');
    // defaultColor:false emits BOTH theme variables per token, never a single
    // inlined color — this is what the module CSS resolves with light-dark().
    expect(html).toContain("--shiki-light");
    expect(html).toContain("--shiki-dark");
  });

  test("tokenizes the source into more than one span (real grammar applied)", async () => {
    const html = await renderHTML(
      <ElmShikiHighlighter code={"const a = 1"} language="typescript" />,
    );
    // A keyword/identifier/number split proves the language grammar resolved
    // rather than a single plaintext blob.
    const spanCount = (html.match(/<span/g) ?? []).length;
    expect(spanCount).toBeGreaterThan(1);
  });

  test("empty code short-circuits before highlighting (no shiki markup)", async () => {
    const html = await renderHTML(<ElmShikiHighlighter code={""} />);
    // `if (!code) return` keeps rawHtml empty, so the inner shiki <pre> is absent.
    expect(html).not.toContain("shiki shiki-themes");
  });

  test("an unknown language degrades gracefully (still produces shiki markup)", async () => {
    const html = await renderHTML(
      <ElmShikiHighlighter
        code={"plain text here"}
        language="not-a-real-language"
      />,
    );
    // shiki falls back to a plaintext grammar instead of throwing; the host
    // still renders highlighted markup.
    expect(html).toContain("shiki");
    expect(html).toContain("plain text here");
  });

  test("forwards extra <pre> attributes (PropsOf<'pre'>) onto the host", async () => {
    const html = await renderHTML(
      <ElmShikiHighlighter
        code={"x"}
        language="txt"
        data-testid="highlighter"
      />,
    );
    expect(html).toContain('data-testid="highlighter"');
  });
});
