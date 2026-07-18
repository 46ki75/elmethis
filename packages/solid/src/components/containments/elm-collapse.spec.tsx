import { render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it } from "vitest";

import { ElmCollapse } from "./elm-collapse";
import styles from "./elm-collapse.module.css";

describe("[CSR] ElmCollapse", () => {
  it("forwards native props and a ref while keeping semantic props private", () => {
    let root: HTMLDivElement | undefined;
    const { getByTestId } = render(() => (
      <ElmCollapse
        ref={(element) => {
          root = element;
        }}
        data-testid="collapse"
        aria-label="Details"
        class="custom-collapse"
        direction="column"
        isOpen
      >
        Content
      </ElmCollapse>
    ));
    const collapse = getByTestId("collapse");

    expect(collapse).toBe(root);
    expect(collapse).toHaveClass("custom-collapse", styles.column, styles.open);
    expect(collapse).toHaveAttribute("aria-label", "Details");
    expect(collapse).not.toHaveAttribute("direction");
    expect(collapse).not.toHaveAttribute("isOpen");
    expect(collapse).toHaveTextContent("Content");
  });

  /* eslint-disable solid/style-prop -- This verifies native string-style passthrough. */
  it("merges styles while the semantic timing prop retains precedence", () => {
    const { getByTestId } = render(() => (
      <>
        <ElmCollapse
          data-testid="object-style"
          transitionTimingFunction="linear"
          style={{
            "--elmethis-scoped-transition-timing-function": "ease",
            width: "10rem",
          }}
        />
        <ElmCollapse
          data-testid="string-style"
          transitionTimingFunction="steps(2)"
          style="--elmethis-scoped-transition-timing-function:ease;width:12rem"
        />
      </>
    ));

    expect(
      getByTestId("object-style").style.getPropertyValue(
        "--elmethis-scoped-transition-timing-function",
      ),
    ).toBe("linear");
    expect(getByTestId("object-style").style.width).toBe("10rem");
    expect(
      getByTestId("string-style").style.getPropertyValue(
        "--elmethis-scoped-transition-timing-function",
      ),
    ).toBe("steps(2)");
    expect(getByTestId("string-style").style.width).toBe("12rem");
  });
  /* eslint-enable solid/style-prop */

  it("reactively updates open state, direction, timing, class, and children", () => {
    const [open, setOpen] = createSignal(false);
    const [direction, setDirection] = createSignal<"row" | "both">("row");
    const { getByTestId } = render(() => (
      <ElmCollapse
        data-testid="collapse"
        class={open() ? "open-class" : "closed-class"}
        isOpen={open()}
        direction={direction()}
        transitionTimingFunction={open() ? "linear" : "ease-in"}
      >
        {open() ? "Open content" : "Closed content"}
      </ElmCollapse>
    ));
    const collapse = getByTestId("collapse");

    expect(collapse).toHaveClass("closed-class", styles.row);
    expect(collapse).not.toHaveClass(styles.open);
    expect(collapse).toHaveTextContent("Closed content");

    setDirection("both");
    setOpen(true);

    expect(collapse).toHaveClass("open-class", styles.both, styles.open);
    expect(collapse).not.toHaveClass("closed-class", styles.row);
    expect(collapse).toHaveTextContent("Open content");
    expect(
      collapse.style.getPropertyValue(
        "--elmethis-scoped-transition-timing-function",
      ),
    ).toBe("linear");
  });
});
