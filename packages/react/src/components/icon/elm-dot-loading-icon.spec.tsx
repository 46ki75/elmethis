import { describe, expect, test } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmDotLoadingIcon } from "./elm-dot-loading-icon";

describe("[CSR]", () => {
  test("renders exactly three decorative (aria-hidden) dots", () => {
    const { container } = render(<ElmDotLoadingIcon />);
    // The three bouncing dots are purely presentational.
    const dots = container.querySelectorAll('span[aria-hidden="true"]');
    expect(dots.length).toBe(3);
  });

  test("size prop is forwarded to the --elmethis-scoped-size var", () => {
    const { container } = render(<ElmDotLoadingIcon size="2rem" />);
    const root = container.querySelector("span")!;
    expect(root.style.getPropertyValue("--elmethis-scoped-size")).toBe("2rem");
  });
});

describe("[SSR]", () => {
  test("renders three dots in the SSR shell", () => {
    const html = renderToStaticMarkup(<ElmDotLoadingIcon />);
    const matches = html.match(/aria-hidden="true"/g) ?? [];
    expect(matches.length).toBe(3);
  });
});
