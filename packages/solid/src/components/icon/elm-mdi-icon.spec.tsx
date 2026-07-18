import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmMdiIcon } from "./elm-mdi-icon";

const PATH = "M2 12L8 6L9.4 7.4L4.8 12L9.4 16.6L8 18Z";

describe("[CSR] ElmMdiIcon", () => {
  it("renders its path and forwards root SVG attributes and refs", () => {
    let root: SVGSVGElement | undefined;
    const { container, getByLabelText } = render(() => (
      <ElmMdiIcon
        ref={(element) => {
          root = element;
        }}
        d={PATH}
        class="custom-icon"
        aria-label="Code"
        data-icon="mdi"
      />
    ));
    const icon = getByLabelText("Code");

    expect(icon).toBe(root);
    expect(icon).toHaveClass("custom-icon");
    expect(icon).toHaveAttribute("data-icon", "mdi");
    expect(icon).toHaveAttribute("role", "img");
    expect(icon).toHaveAttribute("focusable", "false");
    expect(container.querySelector("path")).toHaveAttribute("d", PATH);
  });

  it("reactively updates size, colors, path, class, and consumer style overrides", () => {
    const [large, setLarge] = createSignal(false);
    const { container } = render(() => (
      <ElmMdiIcon
        d={large() ? "M1 1" : PATH}
        size={large() ? "32px" : "16px"}
        color={large() ? "red" : "blue"}
        lightColor={large() ? "pink" : undefined}
        darkColor={large() ? "maroon" : undefined}
        class={large() ? "large" : "small"}
        style={{ "--dark-color": large() ? "black" : undefined }}
      />
    ));
    const icon = container.querySelector("svg")!;

    expect(icon).toHaveAttribute("width", "16px");
    expect(icon.style.getPropertyValue("--elmethis-scoped-color")).toBe("blue");

    setLarge(true);

    expect(icon).toHaveAttribute("width", "32px");
    expect(icon).toHaveAttribute("height", "32px");
    expect(icon).toHaveAttribute("fill", "red");
    expect(icon).toHaveClass("large");
    expect(icon).not.toHaveClass("small");
    expect(icon.style.getPropertyValue("--elmethis-scoped-color")).toBe("pink");
    expect(icon.style.getPropertyValue("--dark-color")).toBe("black");
    expect(container.querySelector("path")).toHaveAttribute("d", "M1 1");
  });
});
