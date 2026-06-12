import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmCallout, type AlertType } from "./elm-callout";

const renderCSR = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML.toLowerCase();
};

const renderSSR = async (node: JSXOutput) => {
  const { html } = await renderToString(node, { containerTagName: "div" });
  return html.toLowerCase();
};

const TYPES: AlertType[] = ["note", "tip", "important", "warning", "caution"];

describe("[CSR] ElmCallout", () => {
  test("renders slot content inside an <aside>", async () => {
    const html = await renderCSR(<ElmCallout>callout body</ElmCallout>);
    expect(html).toContain("<aside");
    expect(html).toContain("callout body");
  });

  test("defaults to the 'note' type", async () => {
    const html = await renderCSR(<ElmCallout>x</ElmCallout>);
    // The type label is rendered verbatim in the header.
    expect(html).toContain("note");
  });

  // Each variant renders its name in the header and a distinct icon <svg>.
  for (const type of TYPES) {
    test(`type='${type}' labels the header and renders an icon`, async () => {
      const html = await renderCSR(<ElmCallout type={type}>x</ElmCallout>);
      expect(html).toContain(type);
      expect(html).toContain("<svg");
    });
  }

  // The variant icons are distinct paths — confirm two different types produce
  // different markup so the ICON_MAP lookup is actually exercised.
  test("different types render different icon paths", async () => {
    const note = await renderCSR(<ElmCallout type="note">x</ElmCallout>);
    const warning = await renderCSR(<ElmCallout type="warning">x</ElmCallout>);
    const pathOf = (html: string) => html.match(/<path d="([^"]+)"/)?.[1] ?? "";
    expect(pathOf(note)).not.toBe("");
    expect(pathOf(note)).not.toBe(pathOf(warning));
  });
});

describe("[SSR] ElmCallout", () => {
  test("renders the aside, label and body server-side", async () => {
    const html = await renderSSR(
      <ElmCallout type="tip">ssr-callout</ElmCallout>,
    );
    expect(html).toContain("<aside");
    expect(html).toContain("tip");
    expect(html).toContain("ssr-callout");
  });
});
