import { createSignal, Show, omit, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";
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
  "prefix" | "value" | "defaultValue"
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
  const rest = omit(
    props,
    "ref",
    "class",
    "style",
    "children",
    "label",
    "maxLength",
    "maxlength",
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
  );
  const [isFocused, setIsFocused] = createSignal(false);
  const [inputType, setInputType] = createSignal(
    untrack(() => (props.isPassword ? "password" : "text")),
  );
  let input!: HTMLInputElement;

  const setNativeValue = (next: string) => {
    const view = input.ownerDocument.defaultView;
    const prototype = view?.HTMLInputElement.prototype;
    const descriptor = prototype
      ? Object.getOwnPropertyDescriptor(prototype, "value")
      : undefined;

    if (descriptor?.set) {
      descriptor.set.call(input, next);
    } else {
      input.value = next;
    }

    const EventConstructor = view?.Event ?? Event;
    input.dispatchEvent(new EventConstructor("input", { bubbles: true }));
  };

  const handleInput: JSX.InputEventHandler<HTMLInputElement, InputEvent> = (
    event,
  ) => {
    if (typeof props.onInput === "function") {
      props.onInput(event);
    } else if (props.onInput) {
      props.onInput[0](props.onInput[1], event);
    }
  };
  const handleChange: JSX.ChangeEventHandler<HTMLInputElement, Event> = (
    event,
  ) => {
    if (typeof props.onChange === "function") {
      props.onChange(event);
    } else if (props.onChange) {
      props.onChange[0](props.onChange[1], event);
    }
  };
  const handleFocus: JSX.FocusEventHandler<HTMLInputElement, FocusEvent> = (
    event,
  ) => {
    setIsFocused(true);
    if (typeof props.onFocus === "function") {
      props.onFocus(event);
    } else if (props.onFocus) {
      props.onFocus[0](props.onFocus[1], event);
    }
  };
  const handleBlur: JSX.FocusEventHandler<HTMLInputElement, FocusEvent> = (
    event,
  ) => {
    setIsFocused(false);
    if (typeof props.onBlur === "function") {
      props.onBlur(event);
    } else if (props.onBlur) {
      props.onBlur[0](props.onBlur[1], event);
    }
  };

  return (
    <label
      class={clsx(
        styles["elm-text-field"],
        isFocused() && styles.active,
        (props.disabled || props.isLoading) && styles.disabled,
        props.class,
      )}
      style={props.style}
    >
      <span class={clsx(styles.header, isFocused() && styles["label-active"])}>
        {props.icon ?? <ElmMdiIcon path={mdiText} size="0.75rem" />}
        <span>
          {props.label}
          <Show when={props.required}>
            <span class={styles.requierd}>*</span>
          </Show>
        </span>
        <Show when={props.value != null}>
          <ElmInlineText
            color={
              props.maxLength != null &&
              String(props.value).length > props.maxLength
                ? "var(--elmethis-color-accent-error)"
                : "gray"
            }
            size="0.75rem"
          >
            {props.maxLength != null
              ? `${String(props.value).length} / ${props.maxLength}`
              : String(String(props.value).length)}
          </ElmInlineText>
        </Show>
      </span>

      <div class={styles.body}>
        <Show when={props.prefix} keyed>
          {(prefix) => <span class={styles["prefix-suffix"]}>{prefix}</span>}
        </Show>
        <input
          {...rest}
          ref={[
            (element) => {
              input = element;
            },
            props.ref,
          ]}
          value={
            (props.value ?? props.defaultValue) as
              | string
              | number
              | string[]
              | undefined
          }
          type={inputType()}
          maxlength={props.maxLength ?? props.maxlength}
          class={styles.input}
          placeholder={props.placeholder}
          onInput={handleInput}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          disabled={props.disabled || props.isLoading}
          required={props.required}
          style={{
            cursor: props.disabled
              ? "not-allowed"
              : props.isLoading
                ? "progress"
                : "auto",
          }}
          aria-required={
            props.required === undefined
              ? undefined
              : props.required
                ? "true"
                : "false"
          }
        />

        <div class={styles["right-icon-box"]}>
          <span class={styles["prefix-suffix"]}>
            <Show when={props.suffix != null}>
              <ElmInlineText>{props.suffix}</ElmInlineText>
            </Show>
          </span>

          <button
            type="button"
            class={styles["clickable-icon"]}
            aria-label={
              inputType() === "text" ? "Hide password" : "Show password"
            }
            disabled={props.disabled || props.isLoading}
            onClick={() =>
              setInputType((previous) =>
                previous === "text" ? "password" : "text",
              )
            }
          >
            <ElmMdiIcon
              path={inputType() === "text" ? mdiEyeOutline : mdiEyeOffOutline}
              size="1.25rem"
              color="gray"
            />
          </button>

          <button
            type="button"
            class={styles["clickable-icon"]}
            aria-label="Clear text"
            disabled={props.disabled || props.isLoading}
            onClick={() => setNativeValue("")}
          >
            <ElmMdiIcon path={mdiTrashCanOutline} size="1.25rem" color="gray" />
          </button>
        </div>
      </div>

      <div
        class={styles.loading}
        style={{ opacity: props.isLoading ? 1 : 0 }}
      />
    </label>
  );
};
