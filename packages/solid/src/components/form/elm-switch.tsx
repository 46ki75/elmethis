import { omit } from "solid-js";
import type { JSX } from "@solidjs/web";
import { clsx } from "clsx";

import { callEventHandler } from "../../primitives/call-event-handler";
import { mergeStyle } from "../../styles/merge-style";
import styles from "./elm-switch.module.css";

// This display/form dual-use component remains directly controlled so it can
// also act as a passive indicator of parent-owned state.
export interface ElmSwitchProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  /** The color of the switch when checked. */
  color?: string;

  /** The size of the switch. */
  size?: string;

  /** Whether the switch is disabled. */
  disabled?: boolean;

  /** Controlled checked state. The parent owns the state. */
  checked: boolean;

  /** Called with the next checked value when the switch is toggled. */
  onCheckedChange?: (checked: boolean) => void;
}

export const ElmSwitch = (props: ElmSwitchProps) => {
  const rest = omit(
    props,
    "class",
    "style",
    "onClick",
    "color",
    "size",
    "disabled",
    "checked",
    "onCheckedChange",
    "children",
  );

  const handleClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (event) => {
    callEventHandler(props.onClick, event);
    if (!event.defaultPrevented && !props.disabled) {
      props.onCheckedChange?.(!props.checked);
    }
  };

  return (
    <div
      {...rest}
      onClick={handleClick}
      class={props.class}
      style={mergeStyle(props.style, {
        "--elmethis-scoped-color":
          props.color ?? "var(--elmethis-color-primary)",
        "--elmethis-scoped-padding": "2px",
        "--elmethis-scoped-size": props.size ?? "18px",
        "--elmethis-scoped-width":
          "calc(var(--elmethis-scoped-size) * 2 + var(--elmethis-scoped-padding) * 2)",
      })}
    >
      <input
        class={styles.switch}
        type="checkbox"
        checked={props.checked}
        disabled={props.disabled}
        readonly
      />
      <div
        class={clsx(
          styles.bar,
          props.checked && styles.checked,
          props.disabled && styles.disabled,
        )}
      >
        <div
          class={clsx(
            styles.circle,
            props.checked && styles.checked,
            props.disabled && styles.disabled,
          )}
        />
      </div>
    </div>
  );
};
