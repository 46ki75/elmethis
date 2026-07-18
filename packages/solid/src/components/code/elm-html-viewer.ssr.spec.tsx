import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmHtmlViewer } from "./elm-html-viewer";

describe("[SSR] ElmHtmlViewer", () => {
  it("renders the complete accessible shell and inline preview", () => {
    const html = renderToString(() => (
      <ElmHtmlViewer
        html="<p>hello</p>"
        class="custom-viewer"
        data-kind="viewer"
      />
    ));

    expect(html).toContain("<figure");
    expect(html).toContain("custom-viewer");
    expect(html).toContain('data-kind="viewer"');
    expect(html).toContain('aria-label="Download"');
    expect(html).toContain('aria-label="Open in new tab"');
    expect(html).toContain('srcdoc="<p>hello</p>"');
  });

  it("renders direct src, explicit height, and no-referrer without Blob APIs", () => {
    const html = renderToString(() => (
      <ElmHtmlViewer
        src="https://example.com/report.html"
        autoHeight={false}
        height={600}
      />
    ));

    expect(html).toContain('src="https://example.com/report.html"');
    expect(html).toContain('height="600"');
    expect(html).toContain('referrerpolicy="no-referrer"');
    expect(html).not.toContain("srcdoc=");
  });
});
