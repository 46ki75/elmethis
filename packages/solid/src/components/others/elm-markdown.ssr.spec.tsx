import { renderToString } from "solid-js/web";
import { describe, expect, it, vi } from "vitest";

const createHighlighter = vi.hoisted(() => vi.fn());
vi.mock("shiki", () => ({
  bundledLanguages: {},
  bundledLanguagesAlias: {},
  createHighlighter,
}));
vi.mock("@46ki75/ikuma-theme/dark", () => ({ default: {} }));
vi.mock("@46ki75/ikuma-theme/light", () => ({ default: {} }));

import { ElmMarkdown } from "./elm-markdown";

describe("[SSR] ElmMarkdown", () => {
  it("synchronously renders GFM content with client-only code highlighting", () => {
    const html = renderToString(() => (
      <ElmMarkdown
        markdown={`# Server heading

Server paragraph.

\`\`\`typescript
const clientOnly = true;
\`\`\`

| A | B |
| --- | --- |
| 1 | 2 |`}
        class="server-markdown"
        data-render="ssr"
      />
    ));

    expect(html).toContain("<h1");
    expect(html).toContain("Server heading");
    expect(html).toContain("<p");
    expect(html).toContain("<figure");
    expect(html).toContain("<pre");
    expect(html).toContain("const clientOnly");
    expect(html).toContain("<table");
    expect(html).toContain("<th");
    expect(html).toContain("server-markdown");
    expect(html).toContain('data-render="ssr"');
    expect(createHighlighter).not.toHaveBeenCalled();
  });

  it("does not include raw HTML", () => {
    const html = renderToString(() => (
      <ElmMarkdown markdown={'Safe\n\n<script id="unsafe">bad()</script>'} />
    ));

    expect(html).toContain("Safe");
    expect(html).not.toContain("<script");
    expect(html).not.toContain("bad()");
  });
});
