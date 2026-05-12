import {
  $,
  component$,
  PropsOf,
  useSignal,
  type CSSProperties,
  type JSXOutput,
  type Signal,
} from "@builder.io/qwik";
import {
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiText,
  mdiTrashCanOutline,
} from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

import styles from "./elm-text-field.module.css";

export interface ElmTextFieldProps extends Omit<PropsOf<"label">, "onInput$"> {
  label: string;
  maxLength?: number;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;

  /**
   * Controlled value. When provided the parent owns the state.
   */
  value?: Signal<string>;

  /**
   * Icon displayed on the left side of the input.
   *
   * @example <ElmTextField icon={<ElmInlineIcon src={url} />} label="..." />
   */
  icon?: JSXOutput;
  isPassword?: boolean;
  required?: boolean;
}

export const ElmTextField = component$<ElmTextFieldProps>((props) => {
  const {
    class: className,
    style,
    label,
    maxLength,
    suffix,
    placeholder,
    disabled,
    loading,
    value,
    icon,
    isPassword,
    required,
    ...rest
  } = props;

  const isFocused = useSignal(false);
  const inputType = useSignal(isPassword ? "password" : "text");

  return (
    <label
      class={[styles.wrapper, isFocused.value && styles.active, className]}
      style={
        {
          backgroundColor: disabled || loading ? "rgba(0,0,0,0.15)" : undefined,
          ...(style as CSSProperties),
        } as CSSProperties
      }
      {...rest}
    >
      <span
        class={[styles.header, { [styles["label-active"]]: isFocused.value }]}
      >
        {icon ? (
          <div class={styles.icon}>{icon}</div>
        ) : (
          <ElmMdiIcon d={mdiText} size="0.75rem" />
        )}
        <span>
          {label}
          {required && <span class={styles.requierd}>*</span>}
        </span>
        {maxLength != null && (
          <ElmInlineText
            text={`${value?.value.length} / ${maxLength}`}
            color={(value?.value.length ?? -1) > maxLength ? "#c56565" : "gray"}
            size="0.75rem"
          />
        )}
      </span>

      <div class={styles.body}>
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
          <span class={styles.suffix}>
            {suffix != null && <ElmInlineText text={suffix} />}
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
          opacity: loading ? 0.2 : 0,
        }}
      ></div>
    </label>
  );
});
