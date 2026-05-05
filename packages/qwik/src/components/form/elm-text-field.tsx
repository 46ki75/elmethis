import {
  $,
  component$,
  useComputed$,
  useId,
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

export interface ElmTextFieldProps {
  class?: string;

  style?: CSSProperties;

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
  const id = useId();
  const isFocused = useSignal(false);
  const inputType = useSignal(props.isPassword ? "password" : "text");

  const [value, setValue] = useControllableState({
    prop: useComputed$(() => props.value),
    defaultProp: props.defaultValue ?? "",
    onChange: props.onValueChange$,
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
    <div
      class={[styles.wrapper, isFocused.value && styles.active, props.class]}
      style={{
        backgroundColor:
          props.disabled || props.loading ? "rgba(0,0,0,0.15)" : undefined,
        "--highlight-color": isFocused.value ? "#bfa056" : undefined,
        ...props.style,
      }}
    >
      <div class={styles.header}>
        <label for={id} class={styles.label}>
          <span>{props.label}</span>
          {props.required && <span class={styles.requierd}>*</span>}
        </label>
        {props.maxLength != null && (
          <ElmInlineText
            text={`${value.value.length} / ${props.maxLength}`}
            color={value.value.length > props.maxLength ? "#c56565" : "gray"}
            size="0.75rem"
          />
        )}
      </div>

      <div class={styles.body}>
        {props.icon && (
          <ElmMdiIcon d={iconMap[props.icon]} size="1.5rem" color="gray" />
        )}

        <input
          id={id}
          value={value.value}
          type={inputType.value}
          class={styles.input}
          placeholder={props.placeholder}
          onFocus$={() => (isFocused.value = true)}
          onBlur$={() => (isFocused.value = false)}
          disabled={props.disabled || props.loading}
          style={{
            cursor: props.disabled
              ? "not-allowed"
              : props.loading
                ? "progress"
                : "auto",
          }}
          aria-required={props.required}
          onInput$={[
            $((_, el: HTMLInputElement) => setValue(el.value)),
            props.onInput$,
          ]}
        />

        <div class={styles["icon-box"]}>
          <span class={styles.suffix}>
            {props.suffix != null && <ElmInlineText text={props.suffix} />}
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
          opacity: props.loading ? 0.2 : 0,
        }}
      ></div>
    </div>
  );
});
