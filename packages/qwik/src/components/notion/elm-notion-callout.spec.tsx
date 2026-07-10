import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import {
  ElmNotionCallout,
  type NotionCalloutColor,
} from "./elm-notion-callout";
import styles from "./elm-notion-callout.module.css";

const renderCSR = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML;
};

const renderSSR = async (node: JSXOutput) => {
  const { html } = await renderToString(node, { containerTagName: "div" });
  return html;
};

const COLORS: NotionCalloutColor[] = [
  "default",
  "gray",
  "red",
  "orange",
  "yellow",
  "green",
  "cyan",
  "blue",
  "purple",
  "magenta",
];

describe("[CSR] ElmNotionCallout", () => {
  test("renders children inside a <div>", async () => {
    const html = await renderCSR(
      <ElmNotionCallout>callout body</ElmNotionCallout>,
    );
    expect(html.toLowerCase()).toContain("<div");
    expect(html).toContain("callout body");
  });

  test("renders no icon by default", async () => {
    const html = await renderCSR(<ElmNotionCallout>x</ElmNotionCallout>);
    expect(html).not.toContain("<img");
    expect(html).not.toContain('role="img"');
  });

  test("renders an emoji icon", async () => {
    const html = await renderCSR(
      <ElmNotionCallout icon={{ kind: "emoji", emoji: "💡" }}>
        x
      </ElmNotionCallout>,
    );
    expect(html).toContain('role="img"');
    expect(html).toContain("💡");
  });

  test("renders an image icon", async () => {
    const html = await renderCSR(
      <ElmNotionCallout icon={{ kind: "image", src: "/icon.png", alt: "icon" }}>
        x
      </ElmNotionCallout>,
    );
    expect(html).toContain("<img");
    expect(html).toContain('src="/icon.png"');
    expect(html).toContain('alt="icon"');
  });

  test("does not render flavor text for the color", async () => {
    const html = await renderCSR(
      <ElmNotionCallout color="red">x</ElmNotionCallout>,
    );
    expect(html).not.toContain(">red<");
  });

  for (const color of COLORS) {
    test(`color='${color}' applies a distinct class`, async () => {
      const html = await renderCSR(
        <ElmNotionCallout color={color}>x</ElmNotionCallout>,
      );
      expect(html).toContain(styles[color]);
    });
  }

  test("defaults to the 'filled' variant", async () => {
    const html = await renderCSR(<ElmNotionCallout>x</ElmNotionCallout>);
    expect(html).toContain(styles.filled);
  });

  test("switches to the 'outlined' variant", async () => {
    const html = await renderCSR(
      <ElmNotionCallout variant="outlined">x</ElmNotionCallout>,
    );
    expect(html).toContain(styles.outlined);
  });

  test("merges a passthrough class onto the root", async () => {
    const html = await renderCSR(
      <ElmNotionCallout class="custom-class">x</ElmNotionCallout>,
    );
    expect(html).toContain("custom-class");
  });
});

describe("[SSR] ElmNotionCallout", () => {
  test("renders the callout and body server-side", async () => {
    const html = await renderSSR(
      <ElmNotionCallout color="blue" icon={{ kind: "emoji", emoji: "📌" }}>
        ssr-callout
      </ElmNotionCallout>,
    );
    expect(html.toLowerCase()).toContain("<div");
    expect(html).toContain("ssr-callout");
    expect(html).toContain("📌");
  });
});
