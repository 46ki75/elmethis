import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmDotLoadingIcon } from "./elm-dot-loading-icon";

describe("[CSR] ElmDotLoadingIcon", () => {
  it("renders three decorative dots and forwards root attributes and refs", () => {
    let root: HTMLSpanElement | undefined;
    const rendered = render(() => (
      <ElmDotLoadingIcon
        ref={(element) => {
          root = element;
        }}
        class="custom-loader"
        data-testid="loader"
        aria-label="Loading"
      />
    ));
    const loader = rendered.getByTestId("loader");

    expect(loader).toBe(root);
    expect(loader).toHaveClass("custom-loader");
    expect(loader).toHaveAttribute("aria-label", "Loading");
    expect(
      rendered.container.querySelectorAll('span[aria-hidden="true"]'),
    ).toHaveLength(3);
  });

  it("reactively updates size and merges object and string styles", () => {
    const [size, setSize] = createSignal("2rem");
    const rendered = render(() => (
      <>
        <ElmDotLoadingIcon
          data-testid="object"
          size={size()}
          style={{ "--elmethis-scoped-size": "5rem" }}
        />
        <ElmDotLoadingIcon data-testid="reactive" size={size()} />
        {/* eslint-disable-next-line solid/style-prop */}
        <ElmDotLoadingIcon data-testid="string" style="opacity: 0.5" />
      </>
    ));

    expect(
      rendered
        .getByTestId("object")
        .style.getPropertyValue("--elmethis-scoped-size"),
    ).toBe("5rem");
    expect(rendered.getByTestId("string").style.opacity).toBe("0.5");

    setSize("3rem");
    expect(
      rendered
        .getByTestId("object")
        .style.getPropertyValue("--elmethis-scoped-size"),
    ).toBe("5rem");
    expect(
      rendered
        .getByTestId("reactive")
        .style.getPropertyValue("--elmethis-scoped-size"),
    ).toBe("3rem");
  });
});
