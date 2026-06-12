import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmSquareLoadingIcon } from "./elm-square-loading-icon";

// The grid renders `dimensions * dimensions` square cells, each carrying a
// staggered `--elmethis-scoped-delay`. We count the per-square delay var to
// assert the grid size without depending on the hashed CSS-module class name.
const countDelays = (html: string) =>
  (html.match(/--elmethis-scoped-delay:/g) ?? []).length;

describe("[CSR]", () => {
  test("default dimensions=4 renders a 4x4 grid (16 squares)", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSquareLoadingIcon />);
    expect(countDelays(screen.outerHTML)).toBe(16);
  });

  test("dimensions prop scales the grid (3 → 9 squares)", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSquareLoadingIcon dimensions={3} />);
    expect(countDelays(screen.outerHTML)).toBe(9);
  });

  test("size + dimensions feed the scoped CSS vars on the host", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmSquareLoadingIcon size="5rem" dimensions={2} />);
    const html = screen.outerHTML;
    expect(html).toContain("--elmethis-scoped-size:5rem");
    expect(html).toContain("--elmethis-scoped-dimensions:2");
    // Duration is fixed (1200ms) regardless of dimensions.
    expect(html).toContain("--elmethis-scoped-duration:1200ms");
  });
});

describe("[SSR]", () => {
  test("renders the full grid in the SSR shell", async () => {
    const renderResult = await renderToString(<ElmSquareLoadingIcon />, {
      containerTagName: "div",
    });
    expect(countDelays(renderResult.html)).toBe(16);
  });
});
