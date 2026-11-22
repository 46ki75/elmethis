import { Show, omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";

import { callEventHandler } from "../../primitives/call-event-handler";
import { createControllableSignal } from "../../primitives/create-controllable-signal";
import { ElmInlineText } from "../typography/elm-inline-text";
import styles from "./elm-checkbox.module.css";

export interface ElmCheckboxProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /** The label displayed. */
  label: string;

  /** Whether the checkbox is in a loading state. */
  isLoading?: boolean;

  /** Whether the checkbox is disabled. */
  disabled?: boolean;

  /** Controlled checked state. When provided the parent owns the value. */
  checked?: boolean;

  /** Initial checked state when uncontrolled. */
  defaultChecked?: boolean;

  /** Called with the next checked value when the checkbox is toggled. */
  onCheckedChange?: (checked: boolean) => void;
}

export const ElmCheckbox = (props: ElmCheckboxProps) => {
  const rest = omit(
    props,
    "class",
    "onClick",
    "label",
    "isLoading",
    "disabled",
    "checked",
    "defaultChecked",
    "onCheckedChange",
    "children",
  );
  const [isChecked, setIsChecked] = createControllableSignal({
    value: () => props.checked,
    defaultValue: () => props.defaultChecked ?? false,
    onChange: (checked) => props.onCheckedChange?.(checked),
  });

  const handleClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (event) => {
    callEventHandler(props.onClick, event);
    if (!event.defaultPrevented && !props.isLoading && !props.disabled) {
      setIsChecked((checked) => !checked);
    }
  };

  return (
    <div
      {...rest}
      class={clsx(
        styles["elm-checkbox"],
        props.disabled && styles.disabled,
        props.class,
      )}
      onClick={handleClick}
    >
      <div style={{ display: "flex", "align-items": "center", gap: "0.5rem" }}>
        <svg width="24" height="24" class={styles.checkbox}>
          <circle
            cx="0"
            cy="0"
            r="2"
            class={styles["loading-dot"]}
            style={{ opacity: props.isLoading ? 1 : 0 }}
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
            style={{ opacity: props.isLoading ? 1 : 0 }}
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
            class={clsx(
              styles.rect,
              isChecked() && styles.checked,
              props.isLoading && styles.loading,
            )}
            stroke-width="0.8"
          />

          <Show when={isChecked()}>
            <polyline
              class={styles["check-line"]}
              points="5,12 10,17 19,8"
              stroke-width="1.5"
              fill="transparent"
            />
          </Show>

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
            style={{ "stroke-width": "1px" }}
            fill="transparent"
          />
        </svg>
        <ElmInlineText>{props.label}</ElmInlineText>
      </div>
    </div>
  );
};
