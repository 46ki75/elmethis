import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";

import { ElmCollapse } from "./elm-collapse";
import { renderToString } from "@qwik.dev/core/server";
import { Fragment } from "@qwik.dev/core/jsx-runtime";

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
