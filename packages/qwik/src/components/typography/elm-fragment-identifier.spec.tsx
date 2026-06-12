import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmFragmentIdentifier } from "./elm-fragment-identifier";

const renderCSR = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML.toLowerCase();
};

const renderSSR = async (node: JSXOutput) => {
  const { html } = await renderToString(node, { containerTagName: "div" });
  return html.toLowerCase();
};

describe("[CSR] ElmFragmentIdentifier", () => {
  test("renders a `#` marker span", async () => {
    const html = await renderCSR(<ElmFragmentIdentifier id="intro" />);
    expect(html).toContain("<span");
    expect(html).toContain("#");
  });

  // The id drives the click-to-hash behavior; it is captured in the handler
  // closure rather than reflected as a DOM attribute, so assert the marker
  // renders for an arbitrary id without throwing.
  test("renders for an arbitrary id", async () => {
    const html = await renderCSR(<ElmFragmentIdentifier id="some-section-2" />);
    expect(html).toContain("#");
  });
});

describe("[SSR] ElmFragmentIdentifier", () => {
  test("renders the marker in the server shell", async () => {
    const html = await renderSSR(<ElmFragmentIdentifier id="intro" />);
    expect(html).toContain("<span");
    expect(html).toContain("#");
  });
});
