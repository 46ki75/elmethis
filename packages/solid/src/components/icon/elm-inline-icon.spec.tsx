import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmInlineIcon } from "./elm-inline-icon";

const SRC = "https://example.com/icon.svg";

describe("[CSR] ElmInlineIcon", () => {
  it("renders the image and forwards native attributes to its root", () => {
    const onClick = vi.fn();
    let root: HTMLSpanElement | undefined;
    const { container, getByTestId } = render(() => (
      <ElmInlineIcon
        ref={(element) => {
          root = element;
        }}
        src={SRC}
        alt="my icon"
        class="custom-icon"
        data-testid="icon"
        onClick={onClick}
      />
    ));

    const wrapper = getByTestId("icon");
    const image = container.querySelector("img");

    expect(wrapper).toBe(root);
    expect(wrapper).toHaveClass("custom-icon");
    expect(image).toHaveAttribute("src", SRC);
    expect(image).toHaveAttribute("alt", "my icon");

    wrapper.click();
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("reactively applies size and explicit dimensions", () => {
    const [size, setSize] = createSignal(24);
    const [width, setWidth] = createSignal<number>();
    const { container } = render(() => (
      <ElmInlineIcon src={SRC} size={size()} width={width()} height={12} />
    ));
    const image = container.querySelector("img")!;

    expect(image).toHaveAttribute("width", "24");
    expect(image).toHaveAttribute("height", "12");

    setSize(32);
    expect(image).toHaveAttribute("width", "32");

    setWidth(48);
    expect(image).toHaveAttribute("width", "48");
  });
});
