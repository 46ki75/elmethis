import { createSignal, omit, Show, untrack } from "solid-js";
import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";
import { mdiTextLong } from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import styles from "./elm-text-area.module.css";

export interface ElmTextAreaProps extends Omit<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value" | "defaultValue"
> {
  label: string;

  /** Custom icon rendered in the header. Defaults to a text-long glyph. */
  icon?: JSX.Element;

  isLoading?: boolean;

  maxLength?: number;
  value?: string | number | readonly string[];
  defaultValue?: string | number | readonly string[];

  /** Visible rows on initial render. The textarea remains vertically resizable. */
  rows?: number;
}

export const ElmTextArea = (props: ElmTextAreaProps) => {
  const rest = omit(
    props,
    "class",
    "style",
    "children",
    "label",
    "icon",
    "maxLength",
    "maxlength",
    "placeholder",
    "disabled",
    "isLoading",
    "required",
    "value",
    "defaultValue",
    "rows",
    "onInput",
    "onChange",
    "onFocus",
    "onBlur",
  );
  const [isFocused, setIsFocused] = createSignal(false);
  const [internalLength, setInternalLength] = createSignal(
    untrack(() => String(props.defaultValue ?? "").length),
  );
  const hasTrackedValue = () =>
    props.value != null || props.defaultValue != null;
  const length = () =>
    props.value != null ? String(props.value).length : internalLength();

  const handleInput: JSX.InputEventHandler<HTMLTextAreaElement, InputEvent> = (
    event,
  ) => {
    setInternalLength(event.currentTarget.value.length);
    if (typeof props.onInput === "function") {
      props.onInput(event);
    } else if (props.onInput) {
      props.onInput[0](props.onInput[1], event);
    }
  };
  const handleChange: JSX.ChangeEventHandler<HTMLTextAreaElement, Event> = (
    event,
  ) => {
    if (typeof props.onChange === "function") {
      props.onChange(event);
    } else if (props.onChange) {
      props.onChange[0](props.onChange[1], event);
    }
  };
  const handleFocus: JSX.FocusEventHandler<HTMLTextAreaElement, FocusEvent> = (
    event,
  ) => {
    setIsFocused(true);
    if (typeof props.onFocus === "function") {
      props.onFocus(event);
    } else if (props.onFocus) {
      props.onFocus[0](props.onFocus[1], event);
    }
  };
  const handleBlur: JSX.FocusEventHandler<HTMLTextAreaElement, FocusEvent> = (
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
        styles["elm-text-area"],
        isFocused() && styles.active,
        (props.disabled || props.isLoading) && styles.disabled,
        props.class,
      )}
      style={props.style}
    >
      <span class={clsx(styles.header, isFocused() && styles["label-active"])}>
        {props.icon ?? <ElmMdiIcon path={mdiTextLong} size="0.75rem" />}
        <span>
          {props.label}
          <Show when={props.required}>
            <span class={styles.requierd}>*</span>
          </Show>
        </span>
        <Show when={hasTrackedValue()}>
          <ElmInlineText
            color={
              props.maxLength != null && length() > props.maxLength
                ? "var(--elmethis-color-accent-error)"
                : "gray"
            }
            size="0.75rem"
          >
            {props.maxLength != null
              ? `${length()} / ${props.maxLength}`
              : String(length())}
          </ElmInlineText>
        </Show>
      </span>

      <div class={styles.body}>
        <textarea
          {...rest}
          value={
            (props.value ?? props.defaultValue) as
              | string
              | number
              | string[]
              | undefined
          }
          rows={props.rows ?? 3}
          maxlength={props.maxLength ?? props.maxlength}
          class={styles.textarea}
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
      </div>

      <div
        class={styles.loading}
        style={{ opacity: props.isLoading ? 1 : 0 }}
      />
    </label>
  );
};
