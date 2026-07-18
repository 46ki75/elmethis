import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmBlockQuote } from "./elm-block-quote";

describe("[SSR] ElmBlockQuote", () => {
  it("renders its semantic root, content, icons, and native attributes", () => {
    const html = renderToString(() => (
      <ElmBlockQuote
        class="custom-quote"
        cite="https://example.com/source"
        data-quote="server"
      >
        server quote
      </ElmBlockQuote>
    ));

    expect(html).toContain("<blockquote");
    expect(html).toContain("server quote");
    expect(html).toContain("custom-quote");
    expect(html).toContain('cite="https://example.com/source"');
    expect(html).toContain('data-quote="server"');
    expect(html.match(/<svg/g)).toHaveLength(2);
  });
});
