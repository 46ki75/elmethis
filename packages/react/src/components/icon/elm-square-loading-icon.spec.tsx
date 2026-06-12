import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { ElmSquareLoadingIcon } from "./elm-square-loading-icon";

// The grid renders `dimensions * dimensions` square cells, each carrying a
// staggered `--elmethis-scoped-delay`. We count the per-square delay var to
// assert the grid size without depending on the hashed CSS-module class name.
const countDelays = (html: string) =>
  (html.match(/--elmethis-scoped-delay:/g) ?? []).length;

describe("[CSR] ElmSquareLoadingIcon", () => {
  it("default dimensions=4 renders a 4x4 grid (16 squares)", () => {
    const { container } = render(<ElmSquareLoadingIcon />);
    expect(countDelays(container.innerHTML)).toBe(16);
  });

  it("dimensions prop scales the grid (3 → 9 squares)", () => {
    const { container } = render(<ElmSquareLoadingIcon dimensions={3} />);
    expect(countDelays(container.innerHTML)).toBe(9);
  });

  it("size + dimensions feed the scoped CSS vars on the host", () => {
    const { container } = render(
      <ElmSquareLoadingIcon size="5rem" dimensions={2} />,
    );
    const host = container.querySelector("span")!;
    expect(host.style.getPropertyValue("--elmethis-scoped-size")).toBe("5rem");
    expect(host.style.getPropertyValue("--elmethis-scoped-dimensions")).toBe(
      "2",
    );
    // Duration is fixed (1200ms) regardless of dimensions.
    expect(host.style.getPropertyValue("--elmethis-scoped-duration")).toBe(
      "1200ms",
    );
  });

  it("merges a passthrough className onto the root", () => {
    const { container } = render(
      <ElmSquareLoadingIcon className="custom-class" />,
    );
    expect(container.querySelector("span")).toHaveClass("custom-class");
  });
});

describe("[SSR] ElmSquareLoadingIcon", () => {
  it("renders the full grid in the SSR shell", () => {
    const html = renderToStaticMarkup(<ElmSquareLoadingIcon />);
    expect(countDelays(html)).toBe(16);
  });
});
