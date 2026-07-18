import { fireEvent, render } from "@solidjs/testing-library";
import { createSignal } from "solid-js";
import { describe, expect, it, vi } from "vitest";

import { ElmTextArea } from "./elm-text-area";
import styles from "./elm-text-area.module.css";

describe("[CSR] ElmTextArea", () => {
  it("composes native attributes, class, style, and the textarea ref", () => {
    let textareaRef: HTMLTextAreaElement | undefined;
    const rendered = render(() => (
      <ElmTextArea
        ref={(element) => {
          textareaRef = element;
        }}
        label="Notes"
        class="custom-area"
        style={{ width: "24rem" }}
        data-testid="area"
        aria-label="Notes body"
        name="notes"
        placeholder="Type here"
      />
    ));
    const textarea = rendered.getByTestId("area") as HTMLTextAreaElement;
    const root = textarea.closest("label")!;

    expect(textarea).toBe(textareaRef);
    expect(textarea).toHaveAttribute("name", "notes");
    expect(textarea).toHaveAttribute("aria-label", "Notes body");
    expect(textarea).not.toHaveAttribute("label");
    expect(root).toHaveClass("custom-area");
    expect(root.style.width).toBe("24rem");
  });

  it("defaults to three rows and reactively honors native state props", () => {
    const [rows, setRows] = createSignal(3);
    const [loading, setLoading] = createSignal(false);
    const rendered = render(() => (
      <ElmTextArea
        label="Body"
        rows={rows()}
        isLoading={loading()}
        required
        maxLength={20}
      />
    ));
    const textarea = rendered.container.querySelector("textarea")!;
    const root = textarea.closest("label")!;

    expect(textarea).toHaveAttribute("rows", "3");
    expect(textarea).toHaveAttribute("maxlength", "20");
    expect(textarea).toBeRequired();
    setRows(6);
    expect(textarea).toHaveAttribute("rows", "6");
    setLoading(true);
    expect(textarea).toBeDisabled();
    expect(root).toHaveClass(styles.disabled);
  });

  it("supports controlled value updates with native input and change timing", () => {
    const [value, setValue] = createSignal("");
    const onInput = vi.fn();
    const onChange = vi.fn();
    const rendered = render(() => (
      <ElmTextArea
        label="Body"
        value={value()}
        maxLength={20}
        onInput={(event) => {
          onInput(event.currentTarget.value);
          setValue(event.currentTarget.value);
        }}
        onChange={(event) => onChange(event.currentTarget.value)}
      />
    ));
    const textarea = rendered.container.querySelector("textarea")!;

    fireEvent.input(textarea, { target: { value: "hello" } });
    expect(onInput).toHaveBeenCalledWith("hello");
    expect(onChange).not.toHaveBeenCalled();
    expect(textarea.value).toBe("hello");
    expect(rendered.container).toHaveTextContent("5 / 20");

    fireEvent.change(textarea);
    expect(onChange).toHaveBeenCalledWith("hello");
  });

  it("initializes an uncontrolled native value and counter from defaultValue", () => {
    const rendered = render(() => (
      <ElmTextArea label="Body" defaultValue="seed" maxLength={20} />
    ));
    const textarea = rendered.container.querySelector("textarea")!;

    expect(textarea.value).toBe("seed");
    expect(rendered.container).toHaveTextContent("4 / 20");
    fireEvent.input(textarea, { target: { value: "seed plus" } });
    expect(textarea.value).toBe("seed plus");
    expect(rendered.container).toHaveTextContent("9 / 20");
  });

  it("omits the counter without value/defaultValue and composes focus handlers", () => {
    const onFocus = vi.fn();
    const onBlur = vi.fn();
    const rendered = render(() => (
      <ElmTextArea
        label="Plain"
        maxLength={10}
        onFocus={onFocus}
        onBlur={onBlur}
      />
    ));
    const textarea = rendered.container.querySelector("textarea")!;
    const root = textarea.closest("label")!;

    expect(rendered.container).not.toHaveTextContent("/ 10");
    fireEvent.focus(textarea);
    expect(onFocus).toHaveBeenCalledOnce();
    expect(root).toHaveClass(styles.active);
    fireEvent.blur(textarea);
    expect(onBlur).toHaveBeenCalledOnce();
    expect(root).not.toHaveClass(styles.active);
  });
});
