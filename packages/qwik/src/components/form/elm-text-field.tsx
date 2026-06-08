import {
  $,
  component$,
  PropsOf,
  Slot,
  useSignal,
  type Signal,
} from "@qwik.dev/core";
import {
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiText,
  mdiTrashCanOutline,
} from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

import styles from "./elm-text-field.module.css";

// Display/form dual-use component: intentionally does NOT adopt
// `useBindableSignal`. The display case (read-only or upstream-driven
// text) has no "uncontrolled with default" semantic to model, so a direct
// `value: Signal<string>` binding is preferred over the
// controlled/uncontrolled split.
export interface ElmTextFieldProps extends Omit<PropsOf<"label">, "onInput$"> {
  label: string;
  maxLength?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;

  /**
   * Controlled value. When provided the parent owns the state.
   */
  value?: Signal<string>;

  isPassword?: boolean;
  required?: boolean;
}

export const ElmTextField = component$<ElmTextFieldProps>((props) => {
  const {
    class: className,
    style,
    label,
    maxLength,
    prefix,
    suffix,
    placeholder,
    disabled,
    loading,
    value,
    isPassword,
    required,
    ...rest
  } = props;

  const isFocused = useSignal(false);
  const inputType = useSignal(isPassword ? "password" : "text");

  return (
    <label
      class={[
        styles.wrapper,
        isFocused.value && styles.active,
        className,
        {
          [styles.disabled]: disabled || loading,
        },
      ]}
      style={style}
      {...rest}
    >
      <span
        class={[styles.header, { [styles["label-active"]]: isFocused.value }]}
      >
        <Slot name="icon">
          <ElmMdiIcon d={mdiText} size="0.75rem" />
        </Slot>
        <span>
          {label}
          {required && <span class={styles.requierd}>*</span>}
        </span>
        {value != null && (
          <ElmInlineText
            color={
              maxLength != null && value.value.length > maxLength
                ? "var(--elmethis-color-accent-error)"
                : "gray"
            }
            size="0.75rem"
          >
            {maxLength != null
              ? `${value.value.length} / ${maxLength}`
              : `${value.value.length}`}
          </ElmInlineText>
        )}
      </span>

      <div class={styles.body}>
        {prefix && <span class={styles["prefix-suffix"]}>{prefix}</span>}
        <input
          value={value?.value}
          type={inputType.value}
          class={styles.input}
          placeholder={placeholder}
          onFocus$={() => (isFocused.value = true)}
          onBlur$={() => (isFocused.value = false)}
          disabled={disabled || loading}
          style={{
            cursor: disabled ? "not-allowed" : loading ? "progress" : "auto",
          }}
          aria-required={required}
          onInput$={$((_, el: HTMLInputElement) => {
            if (value) value.value = el.value;
          })}
        />

        <div class={styles["right-icon-box"]}>
          <span class={styles["prefix-suffix"]}>
            {suffix != null && <ElmInlineText>{suffix}</ElmInlineText>}
          </span>

          <div
            class={styles["clickable-icon"]}
            onClick$={$(() => {
              if (!props.loading && !props.disabled) {
                inputType.value =
                  inputType.value === "text" ? "password" : "text";
              }
            })}
          >
            <ElmMdiIcon
              d={inputType.value === "text" ? mdiEyeOutline : mdiEyeOffOutline}
              size="1.25rem"
              color="gray"
            />
          </div>

          <div
            class={styles["clickable-icon"]}
            onClick$={$(() => {
              if (!props.loading && !props.disabled && value) {
                value.value = "";
              }
            })}
          >
            <ElmMdiIcon d={mdiTrashCanOutline} size="1.25rem" color="gray" />
          </div>
        </div>
      </div>

      <div
        class={styles.loading}
        style={{
          opacity: loading ? 1 : 0,
        }}
      ></div>
    </label>
  );
});
