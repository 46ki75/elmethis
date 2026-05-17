import {
  $,
  component$,
  PropsOf,
  Slot,
  useSignal,
  type CSSProperties,
  type Signal,
} from "@qwik.dev/core";
import { mdiTextLong } from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

import styles from "./elm-text-area.module.css";

// Display/form dual-use component: intentionally does NOT adopt
// `useBindableSignal`. The display case (read-only or upstream-driven
// text) has no "uncontrolled with default" semantic to model, so a
// direct `value: Signal<string>` binding is preferred over the
// controlled/uncontrolled split.
export interface ElmTextAreaProps extends Omit<PropsOf<"label">, "onInput$"> {
  label: string;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  loading?: boolean;
  required?: boolean;

  /**
   * Controlled value. When provided the parent owns the state.
   */
  value?: Signal<string>;

  /**
   * Visible rows on initial render. The textarea is vertically
   * resizable by default, so this is a starting height, not a cap.
   */
  rows?: number;
}

export const ElmTextArea = component$<ElmTextAreaProps>((props) => {
  const {
    class: className,
    style,
    label,
    maxLength,
    placeholder,
    disabled,
    loading,
    required,
    value,
    rows = 3,
    ...rest
  } = props;

  const isFocused = useSignal(false);

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
        <Slot name="icon">
          <ElmMdiIcon d={mdiTextLong} size="0.75rem" />
        </Slot>
        <span>
          {label}
          {required && <span class={styles.requierd}>*</span>}
        </span>
        {maxLength != null && (
          <ElmInlineText
            text={`${value?.value.length ?? 0} / ${maxLength}`}
            color={(value?.value.length ?? -1) > maxLength ? "#c56565" : "gray"}
            size="0.75rem"
          />
        )}
      </span>

      <div class={styles.body}>
        <textarea
          value={value?.value}
          rows={rows}
          class={styles.textarea}
          placeholder={placeholder}
          onFocus$={() => (isFocused.value = true)}
          onBlur$={() => (isFocused.value = false)}
          disabled={disabled || loading}
          style={{
            cursor: disabled ? "not-allowed" : loading ? "progress" : "auto",
          }}
          aria-required={required}
          onInput$={$((_, el: HTMLTextAreaElement) => {
            if (value) value.value = el.value;
          })}
        />
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
