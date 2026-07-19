import { renderToStringAsync } from "solid-js/web";
import { describe, expect, it, vi } from "vitest";

const shiki = vi.hoisted(() => ({
  codeToHtml: vi.fn(),
  createHighlighter: vi.fn(),
}));
vi.mock("shiki", () => ({
  bundledLanguages: { rust: {} },
  codeToHtml: shiki.codeToHtml,
  createHighlighter: shiki.createHighlighter,
}));
vi.mock("@46ki75/ikuma-theme/dark", () => ({
  default: { name: "ikuma-dark" },
}));
vi.mock("@46ki75/ikuma-theme/light", () => ({
  default: { name: "ikuma-light" },
}));

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

describe("[SSR] ElmShikiHighlighter", () => {
  it("renders highlighted code server-side through Shiki's cached shorthand", async () => {
    shiki.codeToHtml.mockResolvedValue(
      '<pre class="shiki"><code><span style="--shiki-light:#111;--shiki-dark:#eee">server</span></code></pre>',
    );

    const html = await renderToStringAsync(() => (
      <ElmShikiHighlighter
        code={'let server = "<safe> & readable";'}
        language="rust"
        class="server-highlighter"
        data-source="ssr"
      />
    ));

    expect(html).toContain("<pre");
    expect(html).toContain("server-highlighter");
    expect(html).toContain('data-source="ssr"');
    expect(html).toContain('class="shiki"');
    expect(html).toContain("--shiki-light");
    expect(html).toContain("--shiki-dark");
    expect(shiki.codeToHtml).toHaveBeenCalledWith(
      'let server = "<safe> & readable";',
      expect.objectContaining({
        defaultColor: false,
        lang: "rust",
        themes: expect.objectContaining({ dark: expect.anything() }),
      }),
    );
    expect(shiki.createHighlighter).not.toHaveBeenCalled();
  });
});
