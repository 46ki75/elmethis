import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmParagraph } from "./elm-paragraph";

const renderCSR = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML.toLowerCase();
};

const renderSSR = async (node: JSXOutput) => {
  const { html } = await renderToString(node, { containerTagName: "div" });
  return html.toLowerCase();
};

describe("[CSR] ElmParagraph", () => {
  test("renders slot text inside a <p>", async () => {
    const html = await renderCSR(<ElmParagraph>paragraph text</ElmParagraph>);
    expect(html).toContain("<p");
    expect(html).toContain("paragraph text");
  });

  test("color/backgroundColor flow into scoped CSS custom properties", async () => {
    const html = await renderCSR(
      <ElmParagraph color="green" backgroundColor="yellow">
        x
      </ElmParagraph>,
    );
    expect(html).toContain("--elmethis-scoped-color:green");
    expect(html).toContain("--elmethis-scoped-background-color:yellow");
  });

  test("merges a passthrough class onto the root", async () => {
    const html = await renderCSR(
      <ElmParagraph class="custom-class">x</ElmParagraph>,
    );
    expect(html).toContain("custom-class");
  });
});

describe("[SSR] ElmParagraph", () => {
  test("renders the paragraph and text server-side", async () => {
    const html = await renderSSR(<ElmParagraph>ssr-paragraph</ElmParagraph>);
    expect(html).toContain("<p");
    expect(html).toContain("ssr-paragraph");
  });
});
