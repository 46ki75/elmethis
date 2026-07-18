import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmCheckbox } from "./elm-checkbox";
import styles from "./elm-checkbox.module.css";

const isChecked = (root: HTMLElement) =>
  root.querySelector(`.${styles["check-line"]}`) !== null;

describe("[CSR] ElmCheckbox", () => {
  it("forwards native props, class, style, and a ref without leaking semantic props", () => {
    let root: HTMLDivElement | undefined;
    const { getByTestId } = render(() => (
      <ElmCheckbox
        ref={(element) => {
          root = element;
        }}
        label="Accept terms"
        class="custom-checkbox"
        style={{ margin: "1rem" }}
        data-testid="checkbox"
        aria-label="Terms"
        disabled
      />
    ));
    const checkbox = getByTestId("checkbox");

    expect(checkbox).toBe(root);
    expect(checkbox).toHaveClass("custom-checkbox", styles.disabled);
    expect(checkbox.style.margin).toBe("1rem");
    expect(checkbox).toHaveAttribute("aria-label", "Terms");
    expect(checkbox).not.toHaveAttribute("label");
    expect(checkbox).not.toHaveAttribute("disabled");
  });

  it("toggles uncontrolled state from the default and reports changes", () => {
    const onCheckedChange = vi.fn();
    const { getByTestId } = render(() => (
      <ElmCheckbox
        data-testid="checkbox"
        label="Toggle"
        defaultChecked
        onCheckedChange={onCheckedChange}
      />
    ));
    const checkbox = getByTestId("checkbox");

    expect(isChecked(checkbox)).toBe(true);
    fireEvent.click(checkbox);
    expect(isChecked(checkbox)).toBe(false);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it("treats false as controlled and follows parent updates", () => {
    const [checked, setChecked] = createSignal(false);
    const { getByTestId } = render(() => (
      <>
        <output data-testid="state">{String(checked())}</output>
        <ElmCheckbox
          data-testid="checkbox"
          label="Controlled"
          checked={checked()}
          onCheckedChange={setChecked}
        />
      </>
    ));
    const checkbox = getByTestId("checkbox");

    expect(isChecked(checkbox)).toBe(false);
    fireEvent.click(checkbox);
    expect(getByTestId("state")).toHaveTextContent("true");
    expect(isChecked(checkbox)).toBe(true);

    setChecked(false);
    expect(isChecked(checkbox)).toBe(false);
  });

  it("does not mutate a controlled value when the parent declines the change", () => {
    const onCheckedChange = vi.fn();
    const { getByTestId } = render(() => (
      <ElmCheckbox
        data-testid="checkbox"
        label="Controlled"
        checked={false}
        defaultChecked
        onCheckedChange={onCheckedChange}
      />
    ));
    const checkbox = getByTestId("checkbox");

    fireEvent.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(isChecked(checkbox)).toBe(false);
  });

  it("composes consumer clicks and allows preventDefault to cancel toggling", () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const { getByTestId } = render(() => (
      <ElmCheckbox data-testid="checkbox" label="Composed" onClick={onClick} />
    ));
    const checkbox = getByTestId("checkbox");

    fireEvent.click(checkbox);
    expect(onClick).toHaveBeenCalledOnce();
    expect(isChecked(checkbox)).toBe(false);
  });

  it("does not toggle while loading or disabled and updates reactively", () => {
    const [loading, setLoading] = createSignal(true);
    const [disabled, setDisabled] = createSignal(false);
    const [label, setLabel] = createSignal("Pending");
    const { getByTestId } = render(() => (
      <ElmCheckbox
        data-testid="checkbox"
        label={label()}
        isLoading={loading()}
        disabled={disabled()}
      />
    ));
    const checkbox = getByTestId("checkbox");

    fireEvent.click(checkbox);
    expect(isChecked(checkbox)).toBe(false);

    setLoading(false);
    setDisabled(true);
    setLabel("Disabled");
    expect(checkbox).toHaveClass(styles.disabled);
    expect(checkbox).toHaveTextContent("Disabled");
    fireEvent.click(checkbox);
    expect(isChecked(checkbox)).toBe(false);

    setDisabled(false);
    fireEvent.click(checkbox);
    expect(isChecked(checkbox)).toBe(true);
  });
});
