import { describe, expect, test } from "vitest";
import { createDOM } from "@builder.io/qwik/testing";

import { ElmCollapse } from "./elm-collapse";
import { renderToString } from "@builder.io/qwik/server";
import { Fragment } from "@builder.io/qwik/jsx-runtime";

describe("[CSR]", () => {
  test("Should render", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmCollapse>
        <span>Content</span>
      </ElmCollapse>,
    );
    expect(screen.outerHTML).toContain("Content");
  });

  test("Should render with Fragment", async () => {
    const { screen, render } = await createDOM();
    await render(
      <ElmCollapse isOpen={false}>
        <Fragment>With Fragment</Fragment>
      </ElmCollapse>,
    );
    expect(screen.outerHTML).toContain("With Fragment");
  });
});

describe("[SSR]", () => {
  test("Should render", async () => {
    const renderResult = await renderToString(
      <ElmCollapse>
        <span>Content</span>
      </ElmCollapse>,
      { containerTagName: "div" },
    );
    expect(renderResult.html).toContain("Content");
  });
});
