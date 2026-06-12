import { describe, expect, test } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";

import { ElmDotLoadingIcon } from "./elm-dot-loading-icon";

describe("[CSR]", () => {
  test("renders exactly three decorative (aria-hidden) dots", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmDotLoadingIcon />);
    // The three bouncing dots are purely presentational.
    const dots = screen.querySelectorAll('span[aria-hidden="true"]');
    expect(dots.length).toBe(3);
  });

  test("size prop is forwarded to the --elmethis-scoped-size var", async () => {
    const { screen, render } = await createDOM();
    await render(<ElmDotLoadingIcon size="2rem" />);
    expect(screen.outerHTML).toContain("--elmethis-scoped-size:2rem");
  });
});

describe("[SSR]", () => {
  test("renders three dots in the SSR shell", async () => {
    const renderResult = await renderToString(<ElmDotLoadingIcon />, {
      containerTagName: "div",
    });
    const matches = renderResult.html.match(/aria-hidden="true"/g) ?? [];
    expect(matches.length).toBe(3);
  });
});
