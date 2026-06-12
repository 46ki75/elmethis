import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import type { JSXOutput } from "@qwik.dev/core";
import { renderToString } from "@qwik.dev/core/server";

import { ElmList } from "./elm-list";

const renderCSR = async (node: JSXOutput) => {
  const { screen, render } = await createDOM();
  await render(node);
  return screen.outerHTML.toLowerCase();
};

const renderSSR = async (node: JSXOutput) => {
  const { html } = await renderToString(node, { containerTagName: "div" });
  return html.toLowerCase();
};

describe("[CSR] ElmList", () => {
  // `listStyle` selects the list element: "ordered" → <ol>, "unordered" → <ul>.
  test("listStyle='ordered' renders an <ol>", async () => {
    const html = await renderCSR(
      <ElmList listStyle="ordered">
        <li>one</li>
      </ElmList>,
    );
    expect(html).toContain("<ol");
    expect(html).not.toContain("<ul");
    expect(html).toContain("one");
  });

  test("listStyle='unordered' renders a <ul>", async () => {
    const html = await renderCSR(
      <ElmList listStyle="unordered">
        <li>item</li>
      </ElmList>,
    );
    expect(html).toContain("<ul");
    expect(html).not.toContain("<ol");
    expect(html).toContain("item");
  });

  test("renders multiple list items from the slot", async () => {
    const html = await renderCSR(
      <ElmList listStyle="unordered">
        <li>alpha</li>
        <li>beta</li>
      </ElmList>,
    );
    expect(html).toContain("alpha");
    expect(html).toContain("beta");
  });

  // Nested lists are just lists in the slot — both element types should appear.
  test("supports nested lists", async () => {
    const html = await renderCSR(
      <ElmList listStyle="unordered">
        <li>
          parent
          <ElmList listStyle="ordered">
            <li>child</li>
          </ElmList>
        </li>
      </ElmList>,
    );
    expect(html).toContain("<ul");
    expect(html).toContain("<ol");
    expect(html).toContain("parent");
    expect(html).toContain("child");
  });

  test("ordered list forwards the native `type` attribute", async () => {
    const html = await renderCSR(
      <ElmList listStyle="ordered" type="a">
        <li>x</li>
      </ElmList>,
    );
    expect(html).toContain('type="a"');
  });
});

describe("[SSR] ElmList", () => {
  test("renders an <ol> server-side", async () => {
    const html = await renderSSR(
      <ElmList listStyle="ordered">
        <li>ssr-item</li>
      </ElmList>,
    );
    expect(html).toContain("<ol");
    expect(html).toContain("ssr-item");
  });

  test("renders a <ul> server-side", async () => {
    const html = await renderSSR(
      <ElmList listStyle="unordered">
        <li>ssr-item</li>
      </ElmList>,
    );
    expect(html).toContain("<ul");
  });
});
