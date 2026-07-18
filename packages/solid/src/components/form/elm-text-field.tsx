import { createSignal, Show, splitProps, untrack, type JSX } from "solid-js";
import { clsx } from "clsx";
import {
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiText,
  mdiTrashCanOutline,
} from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import styles from "./elm-text-field.module.css";

export interface ElmTextFieldProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "prefix" | "value"
> {
  label: string;
  maxLength?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];

  /** The leading icon slot. Defaults to an `mdiText` icon. */
  icon?: JSX.Element;

  isPassword?: boolean;
  required?: boolean;
}

export const ElmTextField = (props: ElmTextFieldProps) => {
  const [local, rest] = splitProps(props, [
    "ref",
    "class",
    "style",
    "children",
    "label",
    "maxLength",
    "prefix",
    "suffix",
    "placeholder",
    "disabled",
    "isLoading",
    "icon",
    "value",
    "defaultValue",
    "isPassword",
    "required",
    "onInput",
    "onChange",
    "onFocus",
    "onBlur",
  ]);
  const [isFocused, setIsFocused] = createSignal(false);
  const [inputType, setInputType] = createSignal(
    untrack(() => (local.isPassword ? "password" : "text")),
  );
  let input!: HTMLInputElement;

  const setNativeValue = (next: string) => {
    const view = input.ownerDocument.defaultView;
    const prototype = view?.HTMLInputElement.prototype;
    const setter = prototype
      ? Object.getOwnPropertyDescriptor(prototype, "value")?.set
      : undefined;

    if (setter) setter.call(input, next);
    else input.value = next;

    const EventConstructor = view?.Event ?? Event;
    input.dispatchEvent(new EventConstructor("input", { bubbles: true }));
  };

  const handleInput: JSX.InputEventHandler<HTMLInputElement, InputEvent> = (
    event,
  ) => {
    if (typeof local.onInput === "function") local.onInput(event);
    else if (local.onInput) local.onInput[0](local.onInput[1], event);
  };
  const handleChange: JSX.ChangeEventHandler<HTMLInputElement, Event> = (
    event,
  ) => {
    if (typeof local.onChange === "function") local.onChange(event);
    else if (local.onChange) local.onChange[0](local.onChange[1], event);
  };
  const handleFocus: JSX.FocusEventHandler<HTMLInputElement, FocusEvent> = (
    event,
  ) => {
    setIsFocused(true);
    if (typeof local.onFocus === "function") local.onFocus(event);
    else if (local.onFocus) local.onFocus[0](local.onFocus[1], event);
  };
  const handleBlur: JSX.FocusEventHandler<HTMLInputElement, FocusEvent> = (
    event,
  ) => {
    setIsFocused(false);
    if (typeof local.onBlur === "function") local.onBlur(event);
    else if (local.onBlur) local.onBlur[0](local.onBlur[1], event);
  };

  return (
    <label
      class={clsx(
        styles["elm-text-field"],
        isFocused() && styles.active,
        (local.disabled || local.isLoading) && styles.disabled,
        local.class,
      )}
      style={local.style}
    >
      <span class={clsx(styles.header, isFocused() && styles["label-active"])}>
        {local.icon ?? <ElmMdiIcon d={mdiText} size="0.75rem" />}
        <span>
          {local.label}
          <Show when={local.required}>
            <span class={styles.requierd}>*</span>
          </Show>
        </span>
        <Show when={local.value != null}>
          <ElmInlineText
            color={
              local.maxLength != null &&
              String(local.value).length > local.maxLength
                ? "var(--elmethis-color-accent-error)"
                : "gray"
            }
            size="0.75rem"
          >
            {local.maxLength != null
              ? `${String(local.value).length} / ${local.maxLength}`
              : String(String(local.value).length)}
          </ElmInlineText>
        </Show>
      </span>

      <div class={styles.body}>
        <Show when={local.prefix} keyed>
          {(prefix) => <span class={styles["prefix-suffix"]}>{prefix}</span>}
        </Show>
        <input
          {...rest}
          ref={(element) => {
            input = element;
            if (typeof local.ref === "function") local.ref(element);
          }}
          value={
            (local.value ?? local.defaultValue) as
              string | number | string[] | undefined
          }
          type={inputType()}
          maxLength={local.maxLength}
          class={styles.input}
          placeholder={local.placeholder}
          onInput={handleInput}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={local.disabled || local.isLoading}
          required={local.required}
          style={{
            cursor: local.disabled
              ? "not-allowed"
              : local.isLoading
                ? "progress"
                : "auto",
          }}
          aria-required={local.required}
        />

        <div class={styles["right-icon-box"]}>
          <span class={styles["prefix-suffix"]}>
            <Show when={local.suffix != null}>
              <ElmInlineText>{local.suffix}</ElmInlineText>
            </Show>
          </span>

          <button
            type="button"
            class={styles["clickable-icon"]}
            aria-label={
              inputType() === "text" ? "Hide password" : "Show password"
            }
            disabled={local.disabled || local.isLoading}
            onClick={() =>
              setInputType((previous) =>
                previous === "text" ? "password" : "text",
              )
            }
          >
            <ElmMdiIcon
              d={inputType() === "text" ? mdiEyeOutline : mdiEyeOffOutline}
              size="1.25rem"
              color="gray"
            />
          </button>

          <button
            type="button"
            class={styles["clickable-icon"]}
            aria-label="Clear text"
            disabled={local.disabled || local.isLoading}
            onClick={() => setNativeValue("")}
          >
            <ElmMdiIcon d={mdiTrashCanOutline} size="1.25rem" color="gray" />
          </button>
        </div>
      </div>

      <div
        class={styles.loading}
        style={{ opacity: local.isLoading ? 1 : 0 }}
      />
    </label>
  );
};
