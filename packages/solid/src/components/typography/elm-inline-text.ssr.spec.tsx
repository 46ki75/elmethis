import { renderToString } from "solid-js/web";
import { describe, expect, it } from "vitest";

import { ElmInlineText } from "./elm-inline-text";

describe("[SSR] ElmInlineText", () => {
  it("renders native attributes, scoped styles, and semantic wrappers", () => {
    const html = renderToString(() => (
      <ElmInlineText
        class="custom-text"
        data-inline="text"
        color="red"
        bold
        italic
        code
      >
        server
      </ElmInlineText>
    ));

    expect(html).toContain("<span");
    expect(html).toContain("<code");
    expect(html).toContain("<strong");
    expect(html).toContain("<em");
    expect(html).toContain("server");
    expect(html).toContain("custom-text");
    expect(html).toContain('data-inline="text"');
    expect(html).toContain("--elmethis-scoped-color:red");
    expect(html).not.toContain(" bold=");
  });

  it("renders ruby and secure external-link markup with a favicon", () => {
    const html = renderToString(() => (
      <ElmInlineText
        ruby="annotation"
        href="https://example.com"
        favicon="https://example.com/favicon.ico"
      >
        base
      </ElmInlineText>
    ));

    expect(html).toContain("<ruby");
    expect(html).toContain("<rt>annotation</rt>");
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('src="https://example.com/favicon.ico"');
  });
});
