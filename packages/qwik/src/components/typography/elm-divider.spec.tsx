import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmDivider } from "./elm-divider";

const renderCSR = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML.toLowerCase();
};

const renderSSR = async (node: JSXOutput) => {
  const { html } = await renderToString(node, { containerTagName: "div" });
  return html.toLowerCase();
};

describe("[CSR] ElmDivider", () => {
  test("renders an <hr>", async () => {
    const html = await renderCSR(<ElmDivider />);
    expect(html).toContain("<hr");
  });

  test("merges a passthrough class onto the root", async () => {
    const html = await renderCSR(<ElmDivider class="custom-divider" />);
    expect(html).toContain("custom-divider");
  });
});

describe("[SSR] ElmDivider", () => {
  test("renders an <hr> server-side", async () => {
    const html = await renderSSR(<ElmDivider />);
    expect(html).toContain("<hr");
  });
});
