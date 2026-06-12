import { describe, expect, test } from "vitest";
import { render, waitFor } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

// Shiki highlights asynchronously inside a `useEffect` (`codeToHtml`), injecting
// the markup via `dangerouslySetInnerHTML`. RTL doesn't await effects the way
// Qwik's createDOM does, so we `waitFor` the highlighted markup to settle. The
// component requests `defaultColor: false`, so each token carries
// `--shiki-light*` / `--shiki-dark*` custom properties (resolved natively with
// light-dark() in CSS); asserting those proves the real highlight pipeline ran.

describe("[CSR] ElmShikiHighlighter — highlighted output", () => {
  test("emits shiki token markup with dual-theme custom properties", async () => {
    const { container } = render(
      <ElmShikiHighlighter code={"let x = 1;"} language="rust" />,
    );
    await waitFor(() => expect(container.innerHTML).toContain('class="line"'));
    const html = container.innerHTML;
    // The real shiki output wraps tokens in `.shiki` and tokenizes into spans.
    expect(html).toContain("shiki");
    expect(html).toContain('class="line"');
    // defaultColor:false emits BOTH theme variables per token, never a single
    // inlined color — this is what the module CSS resolves with light-dark().
    expect(html).toContain("--shiki-light");
    expect(html).toContain("--shiki-dark");
  });

  test("tokenizes the source into more than one span (real grammar applied)", async () => {
    const { container } = render(
      <ElmShikiHighlighter code={"const a = 1"} language="typescript" />,
    );
    await waitFor(() => expect(container.innerHTML).toContain("<span"));
    // A keyword/identifier/number split proves the language grammar resolved
    // rather than a single plaintext blob.
    const spanCount = (container.innerHTML.match(/<span/g) ?? []).length;
    expect(spanCount).toBeGreaterThan(1);
  });

  test("empty code short-circuits before highlighting (no shiki markup)", async () => {
    const { container } = render(<ElmShikiHighlighter code={""} />);
    // `if (!code) return` keeps rawHtml empty, so the inner shiki <pre> is absent.
    await waitFor(() => expect(container.querySelector("pre")).not.toBeNull());
    expect(container.innerHTML).not.toContain("shiki shiki-themes");
  });

  test("an unknown language degrades gracefully (still produces shiki markup)", async () => {
    const { container } = render(
      <ElmShikiHighlighter
        code={"plain text here"}
        language="not-a-real-language"
      />,
    );
    // shiki falls back to a plaintext grammar instead of throwing; the host
    // still renders highlighted markup.
    await waitFor(() =>
      expect(container.innerHTML).toContain("plain text here"),
    );
    expect(container.innerHTML).toContain("shiki");
  });

  test("forwards extra <pre> attributes onto the host", () => {
    const { container } = render(
      <ElmShikiHighlighter
        code={"x"}
        language="txt"
        data-testid="highlighter"
      />,
    );
    expect(container.querySelector("pre")).toHaveAttribute(
      "data-testid",
      "highlighter",
    );
  });
});

describe("[SSR] ElmShikiHighlighter", () => {
  test("renders the host <pre> server-side (effect-driven highlight is client-only)", () => {
    const html = renderToStaticMarkup(
      <ElmShikiHighlighter code={"let x = 1;"} language="rust" />,
    ).toLowerCase();
    expect(html).toContain("<pre");
  });
});
