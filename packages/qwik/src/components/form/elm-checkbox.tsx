import { $, component$, PropsOf, type Signal } from "@qwik.dev/core";

import { ElmInlineText } from "../typography/elm-inline-text";
import { useBindableSignal } from "../../hooks/use-bindable-signal";
import styles from "./elm-checkbox.module.css";

export interface ElmCheckboxProps extends PropsOf<"div"> {
  /**
   * The label displayed.
   */
  label: string;

  /**
   * Whether the checkbox is in a loading state.
   */
  isLoading?: boolean;

  /**
   * Whether the checkbox is disabled.
   */
  disabled?: boolean;

  /**
   * Controlled checked state. When provided the parent owns the signal.
   */
  checked?: Signal<boolean>;

  /**
   * Initial checked state when uncontrolled.
   */
  defaultChecked?: boolean;
}

export const ElmCheckbox = component$<ElmCheckboxProps>((props) => {
  const {
    class: className,
    label,
    isLoading,
    disabled,
    checked,
    defaultChecked,
    ...rest
  } = props;

  const isChecked = useBindableSignal({
    signal: checked,
    defaultValue: defaultChecked ?? false,
  });

  return (
    <div
      class={[styles["elm-checkbox"], disabled && styles.disabled, className]}
      onClick$={$(() => {
        if (!props.isLoading && !props.disabled) {
          isChecked.value = !isChecked.value;
        }
      })}
      {...rest}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
        }}
      >
        <svg width="24" height="24" class={styles.checkbox}>
          <circle
            cx="0"
            cy="0"
            r="2"
            class={styles["loading-dot"]}
            style={{ opacity: isLoading ? 1 : 0 }}
          >
            <animate
              attributeName="cx"
              values="4; 20; 20; 4; 4"
              dur="1.2s"
              repeatCount="indefinite"
              keySplines="0.25 0.1 0.25 1; 0.42 0 0.58 1; 0.25 0.1 0.25 1; 0.42 0 0.58 1"
              calcMode="spline"
            />
            <animate
              attributeName="cy"
              values="4; 4; 20; 20; 4"
              dur="1.2s"
              repeatCount="indefinite"
              keySplines="0.25 0.1 0.25 1; 0.42 0 0.58 1; 0.25 0.1 0.25 1; 0.42 0 0.58 1"
              calcMode="spline"
            />
          </circle>

          <circle
            cx="20"
            cy="20"
            r="2"
            class={styles["loading-dot"]}
            style={{ opacity: isLoading ? 1 : 0 }}
          >
            <animate
              attributeName="cx"
              values="20; 4; 4; 20; 20"
              dur="1.2s"
              repeatCount="indefinite"
              keySplines="0.25 0.1 0.25 1; 0.42 0 0.58 1; 0.25 0.1 0.25 1; 0.42 0 0.58 1"
              calcMode="spline"
            />
            <animate
              attributeName="cy"
              values="20; 20; 4; 4; 20"
              dur="1.2s"
              repeatCount="indefinite"
              keySplines="0.25 0.1 0.25 1; 0.42 0 0.58 1; 0.25 0.1 0.25 1; 0.42 0 0.58 1"
              calcMode="spline"
            />
          </circle>

          <rect
            x="4"
            y="4"
            width="16"
            height="16"
            class={[
              styles.rect,
              isChecked.value && styles.checked,
              isLoading && styles.loading,
            ]}
            stroke-width="0.8"
          />

          {isChecked.value && (
            <polyline
              class={styles["check-line"]}
              points="5,12 10,17 19,8"
              stroke-width="1.5"
              fill="transparent"
            />
          )}

          <line
            x1="0"
            y1="1"
            x2="4"
            y2="1"
            stroke-width="2"
            fill="transparent"
          />
          <line
            x1="4"
            y1="0"
            x2="24"
            y2="0"
            stroke-width="1"
            fill="transparent"
          />
          <line
            x1="0"
            y1="4"
            x2="0"
            y2="16"
            stroke-width="1"
            fill="transparent"
          />
          <line
            x1="0"
            y1="18"
            x2="0"
            y2="20"
            stroke-width="1"
            fill="transparent"
          />
          <line
            x1="0"
            y1="24"
            x2="20"
            y2="24"
            stroke-width="1"
            fill="transparent"
          />
          <line
            x1="20"
            y1="23"
            x2="24"
            y2="23"
            stroke-width="1.5"
            fill="transparent"
          />
          <line
            x1="24"
            y1="4"
            x2="24"
            y2="20"
            style={{ strokeWidth: "1px" }}
            fill="transparent"
          />
        </svg>
        <ElmInlineText>{label}</ElmInlineText>
      </div>
    </div>
  );
});
