import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmMdiIcon } from "./elm-mdi-icon";

const PATH = "M2 12L8 6L9.4 7.4L4.8 12L9.4 16.6L8 18Z";

describe("[CSR] ElmMdiIcon", () => {
  it("renders a decorative currentColor SVG and forwards attributes and refs", () => {
    let root: SVGSVGElement | undefined;
    const { container } = render(() => (
      <ElmMdiIcon
        ref={(element) => {
          root = element;
        }}
        path={PATH}
        class="custom-icon"
        data-icon="mdi"
      />
    ));
    const icon = container.querySelector("svg")!;

    expect(icon).toBe(root);
    expect(icon).toHaveClass("custom-icon");
    expect(icon).toHaveAttribute("data-icon", "mdi");
    expect(icon).toHaveAttribute("aria-hidden", "true");
    expect(icon).not.toHaveAttribute("role");
    expect(icon).toHaveAttribute("focusable", "false");
    expect(icon).toHaveAttribute("fill", "currentColor");
    expect(container.querySelector("path")).toHaveAttribute("d", PATH);
  });

  it("reactively updates size, color, path, label, and class", () => {
    const [large, setLarge] = createSignal(false);
    const { container } = render(() => (
      <ElmMdiIcon
        path={large() ? "M1 1" : PATH}
        size={large() ? 32 : 16}
        color={large() ? "red" : "blue"}
        label={large() ? "Large" : undefined}
        class={large() ? "large" : "small"}
      />
    ));
    const icon = container.querySelector("svg")!;

    expect(icon).toHaveAttribute("width", "16");
    expect(icon).toHaveAttribute("color", "blue");
    expect(icon).toHaveAttribute("aria-hidden", "true");

    setLarge(true);

    expect(icon).toHaveAttribute("width", "32");
    expect(icon).toHaveAttribute("height", "32");
    expect(icon).toHaveAttribute("color", "red");
    expect(icon).toHaveAttribute("fill", "currentColor");
    expect(icon).toHaveAttribute("role", "img");
    expect(icon).not.toHaveAttribute("aria-hidden");
    expect(icon).toHaveClass("large");
    expect(icon).not.toHaveClass("small");
    expect(container.querySelector("title")).toHaveTextContent("Large");
    expect(container.querySelector("path")).toHaveAttribute("d", "M1 1");
  });

  it("uses native ARIA naming when provided", () => {
    const rendered = render(() => <ElmMdiIcon path={PATH} aria-label="Code" />);
    expect(rendered.getByRole("img", { name: "Code" })).not.toHaveAttribute(
      "aria-hidden",
    );
  });
});
