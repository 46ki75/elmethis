import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmHtml, type ElmHtmlProps } from "./elm-html";

describe("[SSR] ElmHtml", () => {
  it("renders safe inline markup without touching browser globals", () => {
    const html = renderToString(() => (
      <ElmHtml
        html={'<p data-value="quoted">inline</p>'}
        class="custom-frame"
        // eslint-disable-next-line solid/style-prop
        style="height:240px;color:red"
        data-kind="artifact"
      />
    ));

    expect(html).toContain("<iframe");
    expect(html).toContain("custom-frame");
    expect(html).toContain('data-kind="artifact"');
    expect(html).toContain('title="Embedded HTML content"');
    expect(html).toContain('sandbox="allow-same-origin"');
    expect(html).toContain("srcdoc=");
    expect(html).not.toMatch(/\ssrc=""/);
    expect(html).not.toContain("referrerpolicy=");
    expect(html).toContain("height:240px;color:red");
  });

  it("renders direct src with no-referrer and no srcdoc", () => {
    const html = renderToString(() => (
      <ElmHtml
        src="https://example.com/report.html?token=secret"
        height={300}
      />
    ));

    expect(html).toContain(
      'src="https://example.com/report.html?token=secret"',
    );
    expect(html).toContain('referrerpolicy="no-referrer"');
    expect(html).toContain('height="300"');
    expect(html).not.toContain("srcdoc=");
  });

  it("protects source, referrer, and sandbox attributes case-insensitively", () => {
    const props = {
      src: "https://example.com/trusted",
      Src: "https://example.com/injected",
      Srcdoc: "<script>injected</script>",
      ReferrerPolicy: "unsafe-url",
      sandbox: "ALLOW-SCRIPTS allow-same-origin allow-forms",
      Sandbox: "allow-scripts allow-same-origin",
    } as unknown as ElmHtmlProps;
    const html = renderToString(() => <ElmHtml {...props} />);

    expect(html).toContain('src="https://example.com/trusted"');
    expect(html).not.toContain("example.com/injected");
    expect(html).not.toContain("injected</script>");
    expect(html).toContain('referrerpolicy="no-referrer"');
    expect(html).not.toContain("unsafe-url");
    expect(html).toContain('sandbox="allow-scripts allow-forms"');
    expect(html).not.toContain("allow-same-origin");
  });

  it("serializes the script reporter only for inline scripted auto-height", () => {
    const automatic = renderToString(() => (
      <ElmHtml html="<p>x</p>" allowScripts />
    ));
    const fixed = renderToString(() => (
      <ElmHtml html="<p>x</p>" allowScripts autoHeight={false} />
    ));

    expect(automatic).toContain("elmethis:elm-html:auto-height");
    expect(fixed).not.toContain("elmethis:elm-html:auto-height");
  });
});
