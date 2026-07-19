import { renderToStringAsync } from "solid-js/web";
import { describe, expect, it, vi } from "vitest";

const shiki = vi.hoisted(() => ({
  createHighlighter: vi.fn(),
}));
vi.mock("shiki", () => ({
  bundledLanguages: { rust: {} },
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
  it("renders highlighted code server-side", async () => {
    const highlighter = {
      codeToHtml: vi.fn(
        () =>
          '<pre class="shiki"><code><span style="--shiki-light:#111;--shiki-dark:#eee">server</span></code></pre>',
      ),
      dispose: vi.fn(),
    };
    shiki.createHighlighter.mockResolvedValue(highlighter);

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
    expect(shiki.createHighlighter).toHaveBeenCalledWith(
      expect.objectContaining({ langs: ["rust"] }),
    );
    expect(highlighter.codeToHtml).toHaveBeenCalledWith(
      'let server = "<safe> & readable";',
      expect.objectContaining({
        defaultColor: false,
        themes: expect.objectContaining({ dark: expect.anything() }),
      }),
    );
    expect(highlighter.dispose).toHaveBeenCalledOnce();
  });
});
