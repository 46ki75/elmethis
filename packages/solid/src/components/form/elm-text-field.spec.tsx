import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmTextField } from "./elm-text-field";
import styles from "./elm-text-field.module.css";

describe("[CSR] ElmTextField", () => {
  it("composes native attributes, class, style, and the input ref", () => {
    let inputRef: HTMLInputElement | undefined;
    const rendered = render(() => (
      <ElmTextField
        ref={(element) => {
          inputRef = element;
        }}
        label="Email"
        prefix="user"
        suffix="@example.com"
        class="custom-field"
        style={{ width: "20rem" }}
        data-testid="field"
        aria-label="Email address"
        name="email"
        placeholder="you@example.com"
      />
    ));
    const input = rendered.getByTestId("field") as HTMLInputElement;
    const root = input.closest("label")!;

    expect(input).toBe(inputRef);
    expect(input).toHaveAttribute("name", "email");
    expect(input).toHaveAttribute("aria-label", "Email address");
    expect(input).not.toHaveAttribute("label");
    expect(input).not.toHaveAttribute("prefix");
    expect(root).toHaveClass("custom-field");
    expect(root.style.width).toBe("20rem");
    expect(root).toHaveTextContent("user");
    expect(root).toHaveTextContent("@example.com");
  });

  it("renders its required state, icon slot, native limit, and counter", () => {
    const rendered = render(() => (
      <ElmTextField
        label="Name"
        value="Ada"
        maxLength={8}
        required
        icon={<span data-testid="custom-icon">icon</span>}
      />
    ));
    const input = rendered.container.querySelector("input")!;

    expect(rendered.getByTestId("custom-icon")).toBeInTheDocument();
    expect(rendered.container).toHaveTextContent("Name*");
    expect(rendered.container).toHaveTextContent("3 / 8");
    expect(input).toBeRequired();
    expect(input).toHaveAttribute("aria-required", "true");
    expect(input.maxLength).toBe(8);
  });

  it("uses defaultValue as an uncontrolled native initial value", () => {
    const rendered = render(() => (
      <ElmTextField label="Name" defaultValue="seed" />
    ));
    const input = rendered.container.querySelector("input")!;

    expect(input.value).toBe("seed");
    fireEvent.input(input, { target: { value: "edited" } });
    expect(input.value).toBe("edited");
  });

  it("uses native input for live updates and native change for commit", () => {
    const onInput = vi.fn();
    const onChange = vi.fn();
    const [value, setValue] = createSignal("");
    const rendered = render(() => (
      <div>
        <output data-testid="value">{value()}</output>
        <ElmTextField
          label="Name"
          value={value()}
          onInput={(event) => {
            onInput(event.currentTarget.value);
            setValue(event.currentTarget.value);
          }}
          onChange={(event) => onChange(event.currentTarget.value)}
        />
      </div>
    ));
    const input = rendered.container.querySelector("input")!;

    fireEvent.input(input, { target: { value: "Ada" } });
    expect(onInput).toHaveBeenCalledWith("Ada");
    expect(onChange).not.toHaveBeenCalled();
    expect(rendered.getByTestId("value")).toHaveTextContent("Ada");
    expect(rendered.container).toHaveTextContent("3");

    fireEvent.change(input);
    expect(onChange).toHaveBeenCalledWith("Ada");
  });

  it("composes focus handlers with the active presentation", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const rendered = render(() => (
      <ElmTextField label="Name" onFocus={onFocus} onBlur={onBlur} />
    ));
    const input = rendered.container.querySelector("input")!;
    const root = input.closest("label")!;

    fireEvent.focus(input);
    expect(onFocus).toHaveBeenCalledOnce();
    expect(root).toHaveClass(styles.active);

    fireEvent.blur(input);
    expect(onBlur).toHaveBeenCalledOnce();
    expect(root).not.toHaveClass(styles.active);
  });

  it("toggles password visibility and clears through a bubbling input event", () => {
    const [value, setValue] = createSignal("secret");
    const onInput = vi.fn();
    const rendered = render(() => (
      <ElmTextField
        label="Password"
        isPassword
        value={value()}
        onInput={(event) => {
          onInput(event);
          setValue(event.currentTarget.value);
        }}
      />
    ));
    const input = rendered.container.querySelector("input")!;
    const show = rendered.getByRole("button", { name: "Show password" });

    expect(input.type).toBe("password");
    expect(show).toHaveAttribute("type", "button");
    fireEvent.click(show);
    expect(input.type).toBe("text");

    const clear = rendered.getByRole("button", { name: "Clear text" });
    expect(clear).toHaveAttribute("type", "button");
    fireEvent.click(clear);
    expect(onInput).toHaveBeenCalledOnce();
    expect(input.value).toBe("");
  });

  it("disables the input and controls while disabled or loading", () => {
    const [loading, setLoading] = createSignal(false);
    const rendered = render(() => (
      <ElmTextField label="Busy" isLoading={loading()} />
    ));
    const input = rendered.container.querySelector("input")!;
    const root = input.closest("label")!;

    expect(input).not.toBeDisabled();
    setLoading(true);
    expect(input).toBeDisabled();
    expect(root).toHaveClass(styles.disabled);
    for (const button of rendered.getAllByRole("button")) {
      expect(button).toBeDisabled();
    }
  });
});
