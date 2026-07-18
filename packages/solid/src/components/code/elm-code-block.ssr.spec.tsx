import { renderToString } from "solid-js/web";
import { describe, expect, it, vi } from "vitest";

vi.mock("./elm-shiki-highlighter", () => ({
  ElmShikiHighlighter: () => <pre />,
}));

import { ElmCodeBlock } from "./elm-code-block";

describe("[SSR] ElmCodeBlock", () => {
  it("renders its shell, caption, children, and empty highlighter host", () => {
    const html = renderToString(() => (
      <ElmCodeBlock
        code="let x = 1;"
        language="rust"
        caption="src/main.rs"
        data-kind="code"
      >
        child caption
      </ElmCodeBlock>
    ));

    expect(html).toContain("<figure");
    expect(html).toContain('data-kind="code"');
    expect(html).toContain("src/main.rs");
    expect(html).toContain("child caption");
    expect(html).toContain("<pre");
    expect(html).not.toContain("let x = 1;");
  });
});
