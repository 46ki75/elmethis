import {
  defineComponent,
  ref,
  type CSSProperties,
  type HTMLAttributes,
} from "vue";
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

export interface ElmTextFieldProps extends Omit<HTMLAttributes, "prefix"> {
  label: string;
  maxLength?: number;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  isPassword?: boolean;
  required?: boolean;

  /**
   * Controlled value. Bind with `v-model:value` (prop `value` +
   * `update:value` event).
   */
  value?: string;
}

export const ElmTextField = defineComponent({
  name: "ElmTextField",
  // The root is the <label>; native attrs (and the focus handlers we wrap)
  // belong on the inner <input>, so attrs are split manually.
  inheritAttrs: false,
  props: {
    label: { type: String, required: true },
    maxLength: { type: Number, default: undefined },
    prefix: { type: String, default: undefined },
    suffix: { type: String, default: undefined },
    placeholder: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
    isLoading: { type: Boolean, default: false },
    isPassword: { type: Boolean, default: false },
    required: { type: Boolean, default: undefined },
    value: { type: String, default: undefined },
  },
  emits: ["update:value"],
  setup(props, { attrs, emit, slots }) {
    const inputRef = ref<HTMLInputElement | null>(null);
    const isFocused = ref(false);
    const inputType = ref(props.isPassword ? "password" : "text");

    // Mirrors the qwik/react twins' clear/toggle imperative writes: dispatch a
    // native input event so the bound `update:value` listener is notified.
    const setNativeValue = (next: string): void => {
      const el = inputRef.value;
      if (!el) return;
      const setter = Object.getOwnPropertyDescriptor(
        window.HTMLInputElement.prototype,
        "value",
      )?.set;
      setter?.call(el, next);
      el.dispatchEvent(new Event("input", { bubbles: true }));
    };

    return () => {
      const {
        class: className,
        style,
        onFocus,
        onBlur,
        ...rest
      } = attrs as Record<string, unknown>;

      const valueLength = props.value != null ? String(props.value).length : 0;

      return (
        <label
          class={clsx(
            styles["elm-text-field"],
            isFocused.value && styles.active,
            (props.disabled || props.isLoading) && styles.disabled,
            className as string | undefined,
          )}
          style={style as CSSProperties}
        >
          <span
            class={clsx(
              styles.header,
              isFocused.value && styles["label-active"],
            )}
          >
            {slots.icon?.() ?? <ElmMdiIcon d={mdiText} size="0.75rem" />}
            <span>
              {props.label}
              {props.required && <span class={styles.requierd}>*</span>}
            </span>
            {props.value != null && (
              <ElmInlineText
                color={
                  props.maxLength != null && valueLength > props.maxLength
                    ? "var(--elmethis-color-accent-error)"
                    : "gray"
                }
                size="0.75rem"
              >
                {props.maxLength != null
                  ? `${valueLength} / ${props.maxLength}`
                  : `${valueLength}`}
              </ElmInlineText>
            )}
          </span>

          <div class={styles.body}>
            {props.prefix && (
              <span class={styles["prefix-suffix"]}>{props.prefix}</span>
            )}
            <input
              ref={inputRef}
              value={props.value}
              type={inputType.value}
              class={styles.input}
              placeholder={props.placeholder}
              onInput={(event: Event) => {
                emit("update:value", (event.target as HTMLInputElement).value);
              }}
              onFocus={(event: FocusEvent) => {
                isFocused.value = true;
                (onFocus as ((e: FocusEvent) => void) | undefined)?.(event);
              }}
              onBlur={(event: FocusEvent) => {
                isFocused.value = false;
                (onBlur as ((e: FocusEvent) => void) | undefined)?.(event);
              }}
              disabled={props.disabled || props.isLoading}
              style={{
                cursor: props.disabled
                  ? "not-allowed"
                  : props.isLoading
                    ? "progress"
                    : "auto",
              }}
              aria-required={props.required}
              {...rest}
            />

            <div class={styles["right-icon-box"]}>
              <span class={styles["prefix-suffix"]}>
                {props.suffix != null && (
                  <ElmInlineText>{props.suffix}</ElmInlineText>
                )}
              </span>

              <div
                class={styles["clickable-icon"]}
                onClick={() => {
                  if (!props.isLoading && !props.disabled) {
                    inputType.value =
                      inputType.value === "text" ? "password" : "text";
                  }
                }}
              >
                <ElmMdiIcon
                  d={
                    inputType.value === "text"
                      ? mdiEyeOutline
                      : mdiEyeOffOutline
                  }
                  size="1.25rem"
                  color="gray"
                />
              </div>

              <div
                class={styles["clickable-icon"]}
                onClick={() => {
                  if (!props.isLoading && !props.disabled) {
                    setNativeValue("");
                  }
                }}
              >
                <ElmMdiIcon
                  d={mdiTrashCanOutline}
                  size="1.25rem"
                  color="gray"
                />
              </div>
            </div>
          </div>

          <div
            class={styles.loading}
            style={{ opacity: props.isLoading ? 1 : 0 } as CSSProperties}
          ></div>
        </label>
      );
    };
  },
});
