import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmBlockFallback } from "./elm-block-fallback";

describe("[CSR] ElmBlockFallback", () => {
  it("composes local loaders and forwards native attributes and refs", () => {
    let root: HTMLDivElement | undefined;
    const { container, getByTestId } = render(() => (
      <ElmBlockFallback
        ref={(element) => {
          root = element;
        }}
        class="custom-fallback"
        data-testid="fallback"
        aria-label="Loading block"
      />
    ));
    const fallback = getByTestId("fallback");

    expect(fallback).toBe(root);
    expect(fallback).toHaveClass("custom-fallback");
    expect(fallback).toHaveAttribute("aria-label", "Loading block");
    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(
      3,
    );
    expect(
      container.querySelector('div[aria-hidden="true"]'),
    ).toBeInTheDocument();
  });

  it("reactively updates height and class while consumer styles can override", () => {
    const [large, setLarge] = createSignal(false);
    const { getByTestId } = render(() => (
      <ElmBlockFallback
        height={large() ? "32rem" : "16rem"}
        class={large() ? "large" : "small"}
        style={large() ? { "--elmethis-scoped-height": "40rem" } : undefined}
        data-testid="fallback"
      />
    ));
    const fallback = getByTestId("fallback");

    expect(fallback.style.getPropertyValue("--elmethis-scoped-height")).toBe(
      "16rem",
    );

    setLarge(true);
    expect(fallback.style.getPropertyValue("--elmethis-scoped-height")).toBe(
      "40rem",
    );
    expect(fallback).toHaveClass("large");
  });
});
