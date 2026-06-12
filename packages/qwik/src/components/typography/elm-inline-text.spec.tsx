import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmInlineText } from "./elm-inline-text";

// Lowercase the rendered HTML so callers can match tag/attribute names without
// worrying about happy-dom's casing.
const renderCSR = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML.toLowerCase();
};

const renderSSR = async (node: JSXOutput) => {
  const { html } = await renderToString(node, { containerTagName: "div" });
  return html.toLowerCase();
};

describe("[CSR] ElmInlineText", () => {
  test("renders slot text inside a <span>", async () => {
    const html = await renderCSR(<ElmInlineText>hello</ElmInlineText>);
    expect(html).toContain("<span");
    expect(html).toContain("hello");
  });

  // Each variant prop wraps the text in a dedicated semantic element. They are
  // independent, so assert one tag per prop.
  test("bold wraps in <strong>", async () => {
    expect(await renderCSR(<ElmInlineText bold>b</ElmInlineText>)).toContain(
      "<strong",
    );
  });

  test("italic wraps in <em>", async () => {
    expect(await renderCSR(<ElmInlineText italic>i</ElmInlineText>)).toContain(
      "<em",
    );
  });

  test("underline wraps in <ins>", async () => {
    expect(
      await renderCSR(<ElmInlineText underline>u</ElmInlineText>),
    ).toContain("<ins");
  });

  test("strikethrough wraps in <del>", async () => {
    expect(
      await renderCSR(<ElmInlineText strikethrough>s</ElmInlineText>),
    ).toContain("<del");
  });

  test("code wraps in <code>", async () => {
    expect(await renderCSR(<ElmInlineText code>c</ElmInlineText>)).toContain(
      "<code",
    );
  });

  test("kbd wraps in <kbd>", async () => {
    expect(await renderCSR(<ElmInlineText kbd>k</ElmInlineText>)).toContain(
      "<kbd",
    );
  });

  test("ruby renders <ruby> with the annotation in <rt>", async () => {
    const html = await renderCSR(
      <ElmInlineText ruby="annotation">base</ElmInlineText>,
    );
    expect(html).toContain("<ruby");
    expect(html).toMatch(/<rt[^>]*>annotation/);
    expect(html).toContain("base");
  });

  test("href renders an external <a> with safe rel/target", async () => {
    const html = await renderCSR(
      <ElmInlineText href="https://example.com">link</ElmInlineText>,
    );
    expect(html).toContain('href="https://example.com"');
    expect(html).toContain('target="_blank"');
    expect(html).toContain('rel="noopener noreferrer"');
  });

  test("favicon renders an inline icon image inside the link", async () => {
    const html = await renderCSR(
      <ElmInlineText
        href="https://example.com"
        favicon="https://example.com/f.ico"
      >
        link
      </ElmInlineText>,
    );
    expect(html).toContain("<img");
    expect(html).toContain('src="https://example.com/f.ico"');
  });

  test("favicon is ignored without an href (no link wrapper)", async () => {
    const html = await renderCSR(
      <ElmInlineText favicon="https://example.com/f.ico">plain</ElmInlineText>,
    );
    expect(html).not.toContain("<a");
    expect(html).not.toContain("<img");
  });

  // Variant props compose by nesting their wrappers; verify multiple apply at once.
  test("bold + italic + code nest together", async () => {
    const html = await renderCSR(
      <ElmInlineText bold italic code>
        x
      </ElmInlineText>,
    );
    expect(html).toContain("<strong");
    expect(html).toContain("<em");
    expect(html).toContain("<code");
  });

  test("color/size/backgroundColor flow into scoped CSS custom properties", async () => {
    const html = await renderCSR(
      <ElmInlineText color="red" size="2em" backgroundColor="blue">
        x
      </ElmInlineText>,
    );
    expect(html).toContain("--elmethis-scoped-color:red");
    expect(html).toContain("--elmethis-scoped-font-size:2em");
    expect(html).toContain("--elmethis-scoped-background-color:blue");
  });
});

describe("[SSR] ElmInlineText", () => {
  test("renders text in the server shell", async () => {
    const html = await renderSSR(<ElmInlineText>server</ElmInlineText>);
    expect(html).toContain("<span");
    expect(html).toContain("server");
  });

  test("variant wrappers are present server-side", async () => {
    const html = await renderSSR(
      <ElmInlineText bold code>
        x
      </ElmInlineText>,
    );
    expect(html).toContain("<strong");
    expect(html).toContain("<code");
  });
});
