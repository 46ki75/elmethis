import {
  $,
  component$,
  PropsOf,
  useSignal,
  type CSSProperties,
} from "@builder.io/qwik";
import {
  mdiAccount,
  mdiArchive,
  mdiBackspaceOutline,
  mdiEarth,
  mdiEmail,
  mdiEyeOffOutline,
  mdiEyeOutline,
  mdiKey,
  mdiLinkVariant,
  mdiLock,
  mdiMagnify,
  mdiPen,
  mdiTag,
  mdiText,
} from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

import styles from "./elm-text-field.module.css";
import { Signal } from "@a2ui/web_core/v0_9";

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

  icon?:
    | "text"
    | "pen"
    | "email"
    | "user"
    | "lock"
    | "key"
    | "earth"
    | "tag"
    | "archive"
    | "link"
    | "search";
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

  const iconMap: Record<NonNullable<ElmTextFieldProps["icon"]>, string> = {
    text: mdiText,
    pen: mdiPen,
    email: mdiEmail,
    user: mdiAccount,
    lock: mdiLock,
    key: mdiKey,
    earth: mdiEarth,
    tag: mdiTag,
    archive: mdiArchive,
    link: mdiLinkVariant,
    search: mdiMagnify,
  };

  return (
    <label
      class={[styles.wrapper, isFocused.value && styles.active, className]}
      style={
        {
          backgroundColor: disabled || loading ? "rgba(0,0,0,0.15)" : undefined,
          "--highlight-color": isFocused.value ? "#bfa056" : undefined,
          ...(style as CSSProperties),
        } as CSSProperties
      }
      {...rest}
    >
      <div class={styles.header}>
        <span class={styles.label}>
          <span>{label}</span>
          {required && <span class={styles.requierd}>*</span>}
        </span>
        {maxLength != null && (
          <ElmInlineText
            text={`${value?.value.length} / ${maxLength}`}
            color={(value?.value.length ?? -1) > maxLength ? "#c56565" : "gray"}
            size="0.75rem"
          />
        )}
      </div>

      <div class={styles.body}>
        {icon && <ElmMdiIcon d={iconMap[icon]} size="1.5rem" color="gray" />}

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

        <div class={styles["icon-box"]}>
          <span class={styles.suffix}>
            {suffix != null && <ElmInlineText text={suffix} />}
          </span>

          <div
            class={styles.icon}
            onClick$={$(() => {
              if (!props.loading && !props.disabled) {
                inputType.value =
                  inputType.value === "text" ? "password" : "text";
              }
            })}
          >
            <ElmMdiIcon
              d={inputType.value === "text" ? mdiEyeOutline : mdiEyeOffOutline}
              size="1.75em"
              color="gray"
            />
          </div>

          <div
            class={styles.icon}
            onClick$={$(() => {
              if (!props.loading && !props.disabled && value) {
                value.value = "";
              }
            })}
          >
            <ElmMdiIcon d={mdiBackspaceOutline} size="1.75em" color="gray" />
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
