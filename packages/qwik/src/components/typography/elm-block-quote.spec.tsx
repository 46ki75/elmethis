import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmBlockQuote } from "./elm-block-quote";

const renderCSR = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML.toLowerCase();
};

const renderSSR = async (node: JSXOutput) => {
  const { html } = await renderToString(node, { containerTagName: "div" });
  return html.toLowerCase();
};

describe("[CSR] ElmBlockQuote", () => {
  test("renders slot content inside a <blockquote>", async () => {
    const html = await renderCSR(<ElmBlockQuote>quoted</ElmBlockQuote>);
    expect(html).toContain("<blockquote");
    expect(html).toContain("quoted");
  });

  // The open/close quote glyphs render as two decorative MDI <svg> icons.
  test("renders the two decorative quote icons", async () => {
    const html = await renderCSR(<ElmBlockQuote>q</ElmBlockQuote>);
    const svgCount = (html.match(/<svg/g) ?? []).length;
    expect(svgCount).toBe(2);
  });
});

describe("[SSR] ElmBlockQuote", () => {
  test("renders the blockquote and content server-side", async () => {
    const html = await renderSSR(<ElmBlockQuote>ssr-quote</ElmBlockQuote>);
    expect(html).toContain("<blockquote");
    expect(html).toContain("ssr-quote");
  });
});
