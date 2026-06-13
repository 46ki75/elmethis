import {
  computed,
  defineComponent,
  ref,
  type CSSProperties,
  type HTMLAttributes,
} from "vue";
import { clsx } from "clsx";
import { mdiTextLong } from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";

import styles from "./elm-text-area.module.css";

// Display/form dual-use component: intentionally does NOT adopt
// `useBindableSignal`. The display case (read-only or upstream-driven text) has
// no "uncontrolled with default" split to model, so a direct `value` /
// `defaultValue` binding is preferred.
export interface ElmTextAreaProps extends HTMLAttributes {
  label: string;

  isLoading?: boolean;

  /**
   * Visible rows on initial render. The textarea is vertically resizable by
   * default, so this is a starting height, not a cap.
   */
  rows?: number;

  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;

  /**
   * Controlled value. Bind with `v-model:value` (prop `value` +
   * `update:value` event).
   */
  value?: string;

  /** Initial value when uncontrolled. */
  defaultValue?: string;
}

export const ElmTextArea = defineComponent({
  name: "ElmTextArea",
  // The root is the <label>; native attrs belong on the inner <textarea>.
  inheritAttrs: false,
  props: {
    label: { type: String, required: true },
    isLoading: { type: Boolean, default: false },
    rows: { type: Number, default: 3 },
    maxLength: { type: Number, default: undefined },
    placeholder: { type: String, default: undefined },
    disabled: { type: Boolean, default: undefined },
    required: { type: Boolean, default: undefined },
    value: { type: String, default: undefined },
    defaultValue: { type: String, default: undefined },
  },
  emits: ["update:value"],
  setup(props, { attrs, emit, slots }) {
    const isFocused = ref(false);

    // The counter reflects the live textarea length. When the parent controls
    // `value`, that drives the display directly; otherwise we track the latest
    // input locally, seeded from `defaultValue`.
    const internalText = ref(String(props.defaultValue ?? ""));
    const currentValue = computed(() =>
      props.value != null ? String(props.value) : internalText.value,
    );
    const hasTrackedValue = computed(
      () => props.value != null || props.defaultValue != null,
    );
    const length = computed(() => currentValue.value.length);

    return () => {
      const {
        class: className,
        style,
        onFocus,
        onBlur,
        ...rest
      } = attrs as Record<string, unknown>;

      return (
        <label
          class={clsx(
            styles["elm-text-area"],
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
            {slots.icon?.() ?? <ElmMdiIcon d={mdiTextLong} size="0.75rem" />}
            <span>
              {props.label}
              {props.required && <span class={styles.requierd}>*</span>}
            </span>
            {hasTrackedValue.value && (
              <ElmInlineText
                color={
                  props.maxLength != null && length.value > props.maxLength
                    ? "var(--elmethis-color-accent-error)"
                    : "gray"
                }
                size="0.75rem"
              >
                {props.maxLength != null
                  ? `${length.value} / ${props.maxLength}`
                  : `${length.value}`}
              </ElmInlineText>
            )}
          </span>

          <div class={styles.body}>
            <textarea
              value={currentValue.value}
              rows={props.rows}
              maxlength={props.maxLength}
              class={styles.textarea}
              placeholder={props.placeholder}
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
              onInput={(event: Event) => {
                const next = (event.target as HTMLTextAreaElement).value;
                internalText.value = next;
                emit("update:value", next);
              }}
              {...rest}
            />
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
