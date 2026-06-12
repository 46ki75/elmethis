import { describe, it, expect } from "vitest";
import { render, fireEvent } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";
import { useState } from "react";

import { ElmSwitch } from "./elm-switch";
import styles from "./elm-switch.module.css";

// `checked` is a required controlled prop, so every case wraps the switch in a
// harness that owns the state and mirrors it for assertions.
const Harness = ({
  initial = false,
  disabled,
}: {
  initial?: boolean;
  disabled?: boolean;
}) => {
  const [checked, setChecked] = useState(initial);
  return (
    <div>
      <output data-testid="state">{String(checked)}</output>
      <ElmSwitch
        checked={checked}
        onCheckedChange={setChecked}
        disabled={disabled}
      />
    </div>
  );
};

describe("[CSR] ElmSwitch — rendering", () => {
  it("renders a checkbox input reflecting the bound value (off)", () => {
    const { container } = render(<Harness />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.checked).toBe(false);
  });

  it("renders checked when the bound state starts true", () => {
    const { container } = render(<Harness initial />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.checked).toBe(true);
    expect(container.querySelector(`.${styles.bar}`)).toHaveClass(
      styles.checked,
    );
  });

  it("disabled forwards onto the input and applies the disabled class", () => {
    const { container } = render(<Harness disabled />);
    const input = container.querySelector("input") as HTMLInputElement;
    expect(input.disabled).toBe(true);
    expect(container.querySelector(`.${styles.bar}`)).toHaveClass(
      styles.disabled,
    );
  });
});

describe("[CSR] ElmSwitch — toggle behavior", () => {
  it("clicking toggles the bound state", () => {
    const { container, getByTestId } = render(<Harness />);
    expect(getByTestId("state")).toHaveTextContent("false");

    fireEvent.click(container.querySelector("input")!);

    expect(getByTestId("state")).toHaveTextContent("true");
  });

  it("does not toggle when disabled", () => {
    const { container, getByTestId } = render(<Harness disabled />);

    fireEvent.click(container.querySelector("input")!);

    expect(getByTestId("state")).toHaveTextContent("false");
  });
});

describe("[SSR] ElmSwitch", () => {
  it("renders a checkbox input in the server shell", () => {
    const html = renderToStaticMarkup(<Harness initial />).toLowerCase();
    expect(html).toContain('type="checkbox"');
  });
});
