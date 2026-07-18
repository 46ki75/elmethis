import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmFragmentIdentifier } from "./elm-fragment-identifier";

describe("[CSR] ElmFragmentIdentifier", () => {
  it("forwards native props and navigates using the current reactive id", () => {
    const [id, setId] = createSignal("first-section");
    const firstScroll = vi.fn();
    const secondScroll = vi.fn();
    let root: HTMLSpanElement | undefined;
    const { getByTestId } = render(() => (
      <>
        <ElmFragmentIdentifier
          ref={(element) => {
            root = element;
          }}
          id={id()}
          class="custom-fragment"
          data-testid="fragment"
          aria-label="Copy section link"
        />
        <div
          id="first-section"
          ref={(element) => {
            element.scrollIntoView = firstScroll;
          }}
        />
        <div
          id="second-section"
          ref={(element) => {
            element.scrollIntoView = secondScroll;
          }}
        />
      </>
    ));
    const fragment = getByTestId("fragment");

    expect(fragment).toBe(root);
    expect(fragment).toHaveTextContent("#");
    expect(fragment).toHaveClass("custom-fragment");
    expect(fragment).not.toHaveAttribute("id");

    fireEvent.click(fragment);
    expect(window.location.hash).toBe("#first-section");
    expect(firstScroll).toHaveBeenCalledWith({ behavior: "smooth" });

    setId("second-section");
    fireEvent.click(fragment);
    expect(window.location.hash).toBe("#second-section");
    expect(secondScroll).toHaveBeenCalledWith({ behavior: "smooth" });
  });
});
