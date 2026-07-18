import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmSwitch } from "./elm-switch";
import styles from "./elm-switch.module.css";

describe("[CSR] ElmSwitch", () => {
  it("forwards native props, class, style, and a ref without leaking semantic props", () => {
    let root: HTMLDivElement | undefined;
    const { getByTestId } = render(() => (
      <ElmSwitch
        ref={(element) => {
          root = element;
        }}
        data-testid="switch"
        aria-label="Feature"
        class="custom-switch"
        style={{ margin: "1rem" }}
        checked={false}
      />
    ));
    const switchRoot = getByTestId("switch");

    expect(switchRoot).toBe(root);
    expect(switchRoot).toHaveClass("custom-switch");
    expect(switchRoot.style.margin).toBe("1rem");
    expect(switchRoot).toHaveAttribute("aria-label", "Feature");
    expect(switchRoot).not.toHaveAttribute("checked");
    expect(switchRoot).not.toHaveAttribute("size");
  });

  /* eslint-disable solid/style-prop -- This verifies native string-style passthrough. */
  it("merges object and string styles after scoped defaults", () => {
    const { getByTestId } = render(() => (
      <>
        <ElmSwitch
          data-testid="object-style"
          checked={false}
          color="red"
          style={{ "--elmethis-scoped-color": "blue" }}
        />
        <ElmSwitch
          data-testid="string-style"
          checked={false}
          color="red"
          style="--elmethis-scoped-color:green"
        />
      </>
    ));

    expect(
      getByTestId("object-style").style.getPropertyValue(
        "--elmethis-scoped-color",
      ),
    ).toBe("blue");
    expect(
      getByTestId("string-style").style.getPropertyValue(
        "--elmethis-scoped-color",
      ),
    ).toBe("green");
  });
  /* eslint-enable solid/style-prop */

  it("reflects falsy controlled state and requests parent-owned updates", () => {
    const [checked, setChecked] = createSignal(false);
    const { getByTestId } = render(() => (
      <>
        <output data-testid="state">{String(checked())}</output>
        <ElmSwitch
          data-testid="switch"
          checked={checked()}
          onCheckedChange={setChecked}
        />
      </>
    ));
    const switchRoot = getByTestId("switch");
    const input = switchRoot.querySelector("input")!;

    expect(input).not.toBeChecked();
    fireEvent.click(switchRoot);
    expect(getByTestId("state")).toHaveTextContent("true");
    expect(input).toBeChecked();
    expect(switchRoot.querySelector(`.${styles.bar}`)).toHaveClass(
      styles.checked,
    );
  });

  it("does not own state when used as a passive indicator", () => {
    const { getByTestId } = render(() => (
      <ElmSwitch data-testid="switch" checked={false} />
    ));
    const switchRoot = getByTestId("switch");

    fireEvent.click(switchRoot);
    expect(switchRoot.querySelector("input")).not.toBeChecked();
  });

  it("composes consumer clicks and allows preventDefault to cancel toggling", () => {
    const onCheckedChange = vi.fn();
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault());
    const { getByTestId } = render(() => (
      <ElmSwitch
        data-testid="switch"
        checked={false}
        onClick={onClick}
        onCheckedChange={onCheckedChange}
      />
    ));

    fireEvent.click(getByTestId("switch"));
    expect(onClick).toHaveBeenCalledOnce();
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("reactively updates checked, disabled, color, size, and class", () => {
    const [checked, setChecked] = createSignal(false);
    const [disabled, setDisabled] = createSignal(false);
    const { getByTestId } = render(() => (
      <ElmSwitch
        data-testid="switch"
        class={checked() ? "on" : "off"}
        checked={checked()}
        disabled={disabled()}
        color={checked() ? "red" : "blue"}
        size={checked() ? "24px" : "18px"}
      />
    ));
    const switchRoot = getByTestId("switch");
    const input = switchRoot.querySelector("input")!;

    setChecked(true);
    setDisabled(true);

    expect(switchRoot).toHaveClass("on");
    expect(switchRoot).not.toHaveClass("off");
    expect(input).toBeChecked();
    expect(input).toBeDisabled();
    expect(switchRoot.style.getPropertyValue("--elmethis-scoped-color")).toBe(
      "red",
    );
    expect(switchRoot.style.getPropertyValue("--elmethis-scoped-size")).toBe(
      "24px",
    );
    expect(switchRoot.querySelector(`.${styles.bar}`)).toHaveClass(
      styles.disabled,
    );
  });

  it("does not request a change when disabled", () => {
    const onCheckedChange = vi.fn();
    const { getByTestId } = render(() => (
      <ElmSwitch
        data-testid="switch"
        checked={false}
        disabled
        onCheckedChange={onCheckedChange}
      />
    ));

    fireEvent.click(getByTestId("switch"));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
