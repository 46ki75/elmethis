import { createSignal, Show, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";
import { mdiTextLong } from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import styles from "./elm-text-area.module.css";

export interface ElmTextAreaProps extends Omit<
  JSX.TextareaHTMLAttributes<HTMLTextAreaElement>,
  "value"
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
  const [local, rest] = splitProps(props, [
    "ref",
    "class",
    "style",
    "children",
    "label",
    "icon",
    "maxLength",
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
  ]);
  const [isFocused, setIsFocused] = createSignal(false);
  const [internalLength, setInternalLength] = createSignal(
    String(local.defaultValue ?? "").length,
  );
  const hasTrackedValue = () =>
    local.value != null || local.defaultValue != null;
  const length = () =>
    local.value != null ? String(local.value).length : internalLength();

  const handleInput: JSX.InputEventHandler<HTMLTextAreaElement, InputEvent> = (
    event,
  ) => {
    setInternalLength(event.currentTarget.value.length);
    if (typeof local.onInput === "function") local.onInput(event);
    else if (local.onInput) local.onInput[0](local.onInput[1], event);
  };
  const handleChange: JSX.ChangeEventHandler<HTMLTextAreaElement, Event> = (
    event,
  ) => {
    if (typeof local.onChange === "function") local.onChange(event);
    else if (local.onChange) local.onChange[0](local.onChange[1], event);
  };
  const handleFocus: JSX.FocusEventHandler<HTMLTextAreaElement, FocusEvent> = (
    event,
  ) => {
    setIsFocused(true);
    if (typeof local.onFocus === "function") local.onFocus(event);
    else if (local.onFocus) local.onFocus[0](local.onFocus[1], event);
  };
  const handleBlur: JSX.FocusEventHandler<HTMLTextAreaElement, FocusEvent> = (
    event,
  ) => {
    setIsFocused(false);
    if (typeof local.onBlur === "function") local.onBlur(event);
    else if (local.onBlur) local.onBlur[0](local.onBlur[1], event);
  };

  return (
    <label
      class={clsx(
        styles["elm-text-area"],
        isFocused() && styles.active,
        (local.disabled || local.isLoading) && styles.disabled,
        local.class,
      )}
      style={local.style}
    >
      <span class={clsx(styles.header, isFocused() && styles["label-active"])}>
        {local.icon ?? <ElmMdiIcon d={mdiTextLong} size="0.75rem" />}
        <span>
          {local.label}
          <Show when={local.required}>
            <span class={styles.requierd}>*</span>
          </Show>
        </span>
        <Show when={hasTrackedValue()}>
          <ElmInlineText
            color={
              local.maxLength != null && length() > local.maxLength
                ? "var(--elmethis-color-accent-error)"
                : "gray"
            }
            size="0.75rem"
          >
            {local.maxLength != null
              ? `${length()} / ${local.maxLength}`
              : String(length())}
          </ElmInlineText>
        </Show>
      </span>

      <div class={styles.body}>
        <textarea
          {...rest}
          ref={(element) => {
            if (typeof local.ref === "function") local.ref(element);
          }}
          value={
            (local.value ?? local.defaultValue) as
              string | number | string[] | undefined
          }
          rows={local.rows ?? 3}
          maxLength={local.maxLength}
          class={styles.textarea}
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
      </div>

      <div
        class={styles.loading}
        style={{ opacity: local.isLoading ? 1 : 0 }}
      />
    </label>
  );
};
