import { renderToString } from "solid-js/web";
import { describe, expect, it, vi } from "vitest";

const createHighlighter = vi.hoisted(() => vi.fn());
vi.mock("shiki", () => ({
  bundledLanguages: { rust: {} },
  bundledLanguagesAlias: {},
  createHighlighter,
}));
vi.mock("@46ki75/ikuma-theme/dark", () => ({ default: {} }));
vi.mock("@46ki75/ikuma-theme/light", () => ({ default: {} }));

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

describe("[SSR] ElmShikiHighlighter", () => {
  it("renders an empty host and never starts Shiki server-side", () => {
    const html = renderToString(() => (
      <ElmShikiHighlighter
        code="let server = false;"
        language="rust"
        class="server-highlighter"
        data-source="ssr"
      />
    ));

    expect(html).toContain("<pre");
    expect(html).toContain("server-highlighter");
    expect(html).toContain('data-source="ssr"');
    expect(html).not.toContain("let server");
    expect(html).not.toContain('class="shiki"');
    expect(createHighlighter).not.toHaveBeenCalled();
  });
});
