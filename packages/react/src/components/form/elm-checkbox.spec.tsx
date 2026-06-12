import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useState } from "react";

import { ElmCheckbox } from "./elm-checkbox";
import styles from "./elm-checkbox.module.css";

// The checkbox renders a `<polyline class="check-line">` only while checked, so
// the presence of that element is the rendered signal of the checked state.
const isChecked = (container: HTMLElement) =>
  container.querySelector(`.${styles["check-line"]}`) !== null;

describe("[CSR] ElmCheckbox — rendering", () => {
  it("renders the label", () => {
    const { container } = render(<ElmCheckbox label="Accept terms" />);
    expect(container.textContent).toContain("Accept terms");
  });

  it("unchecked by default (no check-line)", () => {
    const { container } = render(<ElmCheckbox label="Off" />);
    expect(isChecked(container)).toBe(false);
  });

  it("defaultChecked renders in the checked state when uncontrolled", () => {
    const { container } = render(<ElmCheckbox label="On" defaultChecked />);
    expect(isChecked(container)).toBe(true);
  });

  it("disabled applies the disabled class", () => {
    const { container } = render(<ElmCheckbox label="Disabled" disabled />);
    expect(container.querySelector(`.${styles["elm-checkbox"]}`)).toHaveClass(
      styles.disabled,
    );
  });
});

describe("[CSR] ElmCheckbox — toggle behavior", () => {
  it("clicking toggles the uncontrolled checked state", () => {
    const { container } = render(<ElmCheckbox label="Toggle me" />);
    expect(isChecked(container)).toBe(false);

    fireEvent.click(container.querySelector(`.${styles["elm-checkbox"]}`)!);

    expect(isChecked(container)).toBe(true);
  });

  it("clicking writes through to a bound parent value", () => {
    const Harness = () => {
      const [checked, setChecked] = useState(false);
      return (
        <div>
          <output data-testid="state">{String(checked)}</output>
          <ElmCheckbox
            label="Bound"
            checked={checked}
            onCheckedChange={setChecked}
          />
        </div>
      );
    };

    const { container, getByTestId } = render(<Harness />);
    expect(getByTestId("state")).toHaveTextContent("false");

    fireEvent.click(container.querySelector(`.${styles["elm-checkbox"]}`)!);

    expect(getByTestId("state")).toHaveTextContent("true");
  });

  it("does not toggle when disabled", () => {
    const { container } = render(<ElmCheckbox label="Disabled" disabled />);

    fireEvent.click(container.querySelector(`.${styles["elm-checkbox"]}`)!);

    expect(isChecked(container)).toBe(false);
  });

  it("does not toggle when isLoading", () => {
    const { container } = render(<ElmCheckbox label="Loading" isLoading />);

    fireEvent.click(container.querySelector(`.${styles["elm-checkbox"]}`)!);

    expect(isChecked(container)).toBe(false);
  });
});

describe("[SSR] ElmCheckbox", () => {
  it("renders the label in the server shell", () => {
    const html = renderToStaticMarkup(<ElmCheckbox label="SSR" />);
    expect(html).toContain("SSR");
  });
});
