import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmRectangleWave } from "./elm-rectangle-wave";

describe("[CSR] ElmRectangleWave", () => {
  it("renders an aria-hidden div and forwards native attributes and refs", () => {
    let root: HTMLDivElement | undefined;
    const { getByTestId } = render(() => (
      <ElmRectangleWave
        ref={(element) => {
          root = element;
        }}
        class="custom-wave"
        style={{ width: "10rem" }}
        data-testid="wave"
      />
    ));
    const wave = getByTestId("wave");

    expect(wave).toBe(root);
    expect(wave).toHaveAttribute("aria-hidden", "true");
    expect(wave).toHaveClass("custom-wave");
    expect(wave.getAttribute("style")).toContain("width: 10rem");
  });

  it("reactively updates class and native attributes", () => {
    const [active, setActive] = createSignal(false);
    const { getByTestId } = render(() => (
      <ElmRectangleWave
        class={active() ? "active" : "idle"}
        data-state={active() ? "active" : "idle"}
        data-testid="wave"
      />
    ));
    const wave = getByTestId("wave");

    setActive(true);
    expect(wave).toHaveClass("active");
    expect(wave).not.toHaveClass("idle");
    expect(wave).toHaveAttribute("data-state", "active");
  });
});
