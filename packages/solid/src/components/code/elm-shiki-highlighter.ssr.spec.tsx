import { renderToString } from "solid-js/web";
import { describe, expect, it, vi } from "vitest";

const shiki = vi.hoisted(() => ({
  createHighlighter: vi.fn(),
  runtimeLoaded: false,
}));
vi.mock("shiki", () => {
  shiki.runtimeLoaded = true;
  return {
    bundledLanguages: { rust: {} },
    createHighlighter: shiki.createHighlighter,
  };
});
vi.mock("@46ki75/ikuma-theme/dark", () => ({ default: {} }));
vi.mock("@46ki75/ikuma-theme/light", () => ({ default: {} }));

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

describe("[SSR] ElmShikiHighlighter", () => {
  it("renders escaped source without starting Shiki server-side", () => {
    const html = renderToString(() => (
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
    expect(html).toContain('let server = "&lt;safe> &amp; readable";');
    expect(html).not.toContain("<safe>");
    expect(html).not.toContain('class="shiki"');
    expect(shiki.runtimeLoaded).toBe(false);
    expect(shiki.createHighlighter).not.toHaveBeenCalled();
  });
});
