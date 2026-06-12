import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmHeading } from "./elm-heading";

const renderCSR = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML.toLowerCase();
};

const renderSSR = async (node: JSXOutput) => {
  const { html } = await renderToString(node, { containerTagName: "div" });
  return html.toLowerCase();
};

const LEVELS = [1, 2, 3, 4, 5, 6] as const;

describe("[CSR] ElmHeading", () => {
  // `level` maps directly onto the `h{level}` tag — exercise every level.
  for (const level of LEVELS) {
    test(`level=${level} renders <h${level}>`, async () => {
      const html = await renderCSR(
        <ElmHeading level={level} text={`heading-${level}`} />,
      );
      expect(html).toContain(`<h${level}`);
      expect(html).toContain(`heading-${level}`);
    });
  }

  test("text prop renders inside the heading", async () => {
    const html = await renderCSR(<ElmHeading level={1} text="Title" />);
    expect(html).toContain("title");
  });

  test("slot children render alongside text", async () => {
    const html = await renderCSR(
      <ElmHeading level={3}>
        <span>slotted</span>
      </ElmHeading>,
    );
    expect(html).toContain("slotted");
  });

  // The fragment-identifier anchor is only emitted when an `id` is supplied.
  test("with id: forwards id and renders the fragment-identifier anchor", async () => {
    const html = await renderCSR(
      <ElmHeading level={2} id="section-a" text="Section A" />,
    );
    expect(html).toContain('id="section-a"');
    // ElmFragmentIdentifier renders a literal `#`.
    expect(html).toContain("#");
  });

  test("without id: no fragment-identifier anchor", async () => {
    const html = await renderCSR(<ElmHeading level={2} text="No anchor" />);
    expect(html).not.toContain('id="');
  });

  test("level=2 emits the decorative underline span", async () => {
    const html = await renderCSR(<ElmHeading level={2} text="Underlined" />);
    expect(html).toContain('aria-hidden="true"');
  });

  test("scoped font-size custom property reflects the level", async () => {
    const html = await renderCSR(<ElmHeading level={1} text="x" />);
    expect(html).toContain("--elmethis-scoped-font-size:1.5em");
  });
});

describe("[SSR] ElmHeading", () => {
  test("renders the correct heading tag and text server-side", async () => {
    const html = await renderSSR(<ElmHeading level={4} text="ssr-heading" />);
    expect(html).toContain("<h4");
    expect(html).toContain("ssr-heading");
  });

  test("emits id and anchor server-side", async () => {
    const html = await renderSSR(<ElmHeading level={1} id="ssr-id" text="x" />);
    expect(html).toContain('id="ssr-id"');
  });
});
