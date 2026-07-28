import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmButton } from "./elm-button";
import styles from "./elm-button.module.css";

describe("[CSR] ElmButton", () => {
  it("forwards native props and a ref while keeping semantic props private", () => {
    let root: HTMLButtonElement | undefined;
    const { getByRole } = render(() => (
      <ElmButton
        ref={(element) => {
          root = element;
        }}
        class="custom-button"
        data-button="native"
        aria-label="Submit form"
        primary
        block
      >
        Submit
      </ElmButton>
    ));
    const button = getByRole("button", { name: "Submit form" });

    expect(button).toBe(root);
    expect(button).toHaveClass("custom-button", styles.primary);
    expect(button).toHaveAttribute("data-button", "native");
    expect(button).not.toHaveAttribute("primary");
    expect(button).not.toHaveAttribute("block");
  });

  /* eslint-disable solid/style-prop -- This verifies native string-style passthrough. */
  it("merges object and string styles after component defaults", () => {
    const { getByTestId } = render(() => (
      <>
        <ElmButton
          data-testid="object-style"
          color="red"
          style={{ "--elmethis-scoped-color": "blue", width: "12rem" }}
        >
          Object
        </ElmButton>
        <ElmButton
          data-testid="string-style"
          color="red"
          style="--elmethis-scoped-color:green;width:10rem"
        >
          String
        </ElmButton>
      </>
    ));

    expect(
      getByTestId("object-style").style.getPropertyValue(
        "--elmethis-scoped-color",
      ),
    ).toBe("blue");
    expect(getByTestId("object-style").style.width).toBe("12rem");
    expect(
      getByTestId("string-style").style.getPropertyValue(
        "--elmethis-scoped-color",
      ),
    ).toBe("green");
    expect(getByTestId("string-style").style.width).toBe("10rem");
  });
  /* eslint-enable solid/style-prop */

  it("reactively updates variants, loading content, layout, and disabled state", () => {
    const [loading, setLoading] = createSignal(false);
    const [disabled, setDisabled] = createSignal(false);
    const [primary, setPrimary] = createSignal(false);
    const { getByRole } = render(() => (
      <ElmButton
        class={loading() ? "loading" : "ready"}
        isLoading={loading()}
        disabled={disabled()}
        primary={primary()}
        block={primary()}
      >
        Save
      </ElmButton>
    ));
    const button = getByRole("button");

    expect(button).toHaveClass("ready", styles.normal, styles.enable);
    expect(button).toHaveTextContent("Save");

    setPrimary(true);
    expect(button).toHaveClass(styles.primary);
    expect(button.style.display).toBe("flex");
    expect(button.style.width).toBe("100%");

    setLoading(true);
    expect(button).toHaveClass("loading");
    expect(button).not.toHaveClass("ready", styles.enable);
    expect(button).not.toHaveTextContent("Save");
    expect(
      button.querySelector('[class*="elm-dot-loading-icon"]'),
    ).not.toBeNull();

    setDisabled(true);
    expect(button).toBeDisabled();
    expect(button.style.cursor).toBe("not-allowed");
  });

  it("composes function and tuple click handlers", () => {
    const functionHandler = vi.fn();
    const tupleHandler = vi.fn();
    const first = render(() => (
      <ElmButton onClick={functionHandler}>Go</ElmButton>
    ));

    fireEvent.click(first.getByRole("button"));
    expect(functionHandler).toHaveBeenCalledOnce();

    first.unmount();
    const second = render(() => (
      <ElmButton onClick={[tupleHandler, "bound"]}>Again</ElmButton>
    ));
    fireEvent.click(second.getByRole("button"));
    expect(tupleHandler).toHaveBeenCalledWith("bound", expect.any(MouseEvent));
  });

  it("suppresses clicks while loading or disabled", () => {
    const onClick = vi.fn();
    const { getAllByRole } = render(() => (
      <>
        <ElmButton isLoading onClick={onClick} aria-label="Loading" />
        <ElmButton disabled onClick={onClick}>
          Disabled
        </ElmButton>
      </>
    ));

    for (const button of getAllByRole("button")) fireEvent.click(button);

    expect(onClick).not.toHaveBeenCalled();
  });
});
