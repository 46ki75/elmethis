import {
  $,
  component$,
  PropsOf,
  useComputed$,
  useSignal,
  type CSSProperties,
  type PropFunction,
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
import { useControllableState } from "../../hooks/use-controllable-state";

import styles from "./elm-text-field.module.css";

export interface ElmTextFieldProps extends PropsOf<"label"> {
  label: string;
  maxLength?: number;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;

  /**
   * Controlled value. When provided the parent owns the state.
   */
  value?: string;

  /**
   * Initial value when uncontrolled.
   */
  defaultValue?: string;

  /**
   * Called whenever the input value changes.
   */
  onValueChange$?: PropFunction<(value: string) => void>;

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

  onInput$?: PropFunction<(event: InputEvent, element: HTMLInputElement) => void>;
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
    value: valueProp,
    defaultValue,
    onValueChange$,
    icon,
    isPassword,
    required,
    onInput$,
    ...rest
  } = props;

  const isFocused = useSignal(false);
  const inputType = useSignal(isPassword ? "password" : "text");

  const [value, setValue] = useControllableState({
    prop: useComputed$(() => valueProp),
    defaultProp: defaultValue ?? "",
    onChange: onValueChange$,
  });

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
      style={{
        backgroundColor:
          disabled || loading ? "rgba(0,0,0,0.15)" : undefined,
        "--highlight-color": isFocused.value ? "#bfa056" : undefined,
        ...(style as CSSProperties),
      } as CSSProperties}
      {...rest}
    >
      <div class={styles.header}>
        <span class={styles.label}>
          <span>{label}</span>
          {required && <span class={styles.requierd}>*</span>}
        </span>
        {maxLength != null && (
          <ElmInlineText
            text={`${value.value.length} / ${maxLength}`}
            color={value.value.length > maxLength ? "#c56565" : "gray"}
            size="0.75rem"
          />
        )}
      </div>

      <div class={styles.body}>
        {icon && (
          <ElmMdiIcon d={iconMap[icon]} size="1.5rem" color="gray" />
        )}

        <input
          value={value.value}
          type={inputType.value}
          class={styles.input}
          placeholder={placeholder}
          onFocus$={() => (isFocused.value = true)}
          onBlur$={() => (isFocused.value = false)}
          disabled={disabled || loading}
          style={{
            cursor: disabled
              ? "not-allowed"
              : loading
                ? "progress"
                : "auto",
          }}
          aria-required={required}
          onInput$={[
            $((_, el: HTMLInputElement) => setValue(el.value)),
            onInput$,
          ]}
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
              if (!props.loading && !props.disabled) {
                setValue("");
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
