import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmBookmark } from "./elm-bookmark";

describe("[SSR] ElmBookmark", () => {
  it("renders the safe link, content, and forwarded root attributes", () => {
    const html = renderToString(() => (
      <ElmBookmark
        title="Example"
        description="An example site"
        url="https://example.com"
        image="https://example.com/og.png"
        class="custom-bookmark"
        data-bookmark="example"
      />
    ));

    expect(html).toContain("<a");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain("Example");
    expect(html).toContain("An example site");
    expect(html).toContain("custom-bookmark");
    expect(html).toContain('data-bookmark="example"');
  });

  it("hides an absent image without accessing browser globals", () => {
    const html = renderToString(() => <ElmBookmark title="No image" />);

    expect(html).toContain("visibility:hidden");
    expect(html).toContain("width:0");
  });
});
