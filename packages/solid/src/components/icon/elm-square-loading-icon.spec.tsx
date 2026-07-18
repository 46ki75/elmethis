import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmSquareLoadingIcon } from "./elm-square-loading-icon";

const squares = (root: HTMLElement) =>
  [...root.querySelectorAll("span")].filter((element) =>
    element.style.getPropertyValue("--elmethis-scoped-delay"),
  );

describe("[CSR] ElmSquareLoadingIcon", () => {
  it("renders the grid and forwards native attributes and refs", () => {
    let root: HTMLSpanElement | undefined;
    const { getByTestId } = render(() => (
      <ElmSquareLoadingIcon
        ref={(element) => {
          root = element;
        }}
        dimensions={3}
        class="custom-grid"
        data-testid="grid"
      />
    ));
    const grid = getByTestId("grid");

    expect(grid).toBe(root);
    expect(grid).toHaveClass("custom-grid");
    expect(squares(grid)).toHaveLength(9);
    expect(grid.style.getPropertyValue("--elmethis-scoped-dimensions")).toBe(
      "3",
    );
    expect(grid.style.getPropertyValue("--elmethis-scoped-duration")).toBe(
      "1200ms",
    );
  });

  it("reactively updates dimensions, size, class, and stagger delays", () => {
    const [dimensions, setDimensions] = createSignal(2);
    const { getByTestId } = render(() => (
      <ElmSquareLoadingIcon
        dimensions={dimensions()}
        size={dimensions() === 2 ? "4rem" : "6rem"}
        class={dimensions() === 2 ? "small" : "large"}
        data-testid="grid"
      />
    ));
    const grid = getByTestId("grid");

    expect(squares(grid)).toHaveLength(4);
    expect(
      squares(grid)[1]?.style.getPropertyValue("--elmethis-scoped-delay"),
    ).toBe("200ms");

    setDimensions(3);

    expect(squares(grid)).toHaveLength(9);
    expect(grid.style.getPropertyValue("--elmethis-scoped-size")).toBe("6rem");
    expect(grid).toHaveClass("large");
    expect(grid).not.toHaveClass("small");
    expect(
      squares(grid)[1]?.style.getPropertyValue("--elmethis-scoped-delay"),
    ).toBe("133.33333333333334ms");
  });
});
