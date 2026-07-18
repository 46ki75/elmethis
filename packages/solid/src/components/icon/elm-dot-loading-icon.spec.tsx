import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmDotLoadingIcon } from "./elm-dot-loading-icon";

describe("[CSR] ElmDotLoadingIcon", () => {
  it("renders three decorative dots and forwards root attributes and refs", () => {
    let root: HTMLSpanElement | undefined;
    const { container, getByTestId } = render(() => (
      <ElmDotLoadingIcon
        ref={(element) => {
          root = element;
        }}
        class="custom-loader"
        data-testid="loader"
        aria-label="Loading"
      />
    ));
    const loader = getByTestId("loader");

    expect(loader).toBe(root);
    expect(loader).toHaveClass("custom-loader");
    expect(loader).toHaveAttribute("aria-label", "Loading");
    expect(container.querySelectorAll('span[aria-hidden="true"]')).toHaveLength(
      3,
    );
  });

  it("reactively updates size and merges object and string styles", () => {
    const [size, setSize] = createSignal("2rem");
    const { getByTestId } = render(() => (
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
      getByTestId("object").style.getPropertyValue("--elmethis-scoped-size"),
    ).toBe("5rem");
    expect(getByTestId("string").style.opacity).toBe("0.5");

    setSize("3rem");
    expect(
      getByTestId("object").style.getPropertyValue("--elmethis-scoped-size"),
    ).toBe("5rem");
    expect(
      getByTestId("reactive").style.getPropertyValue("--elmethis-scoped-size"),
    ).toBe("3rem");
  });
});
