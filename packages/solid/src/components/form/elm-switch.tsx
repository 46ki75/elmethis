import { mergeProps, splitProps, type JSX } from "solid-js";
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
  const merged = mergeProps(
    { color: "var(--elmethis-color-primary)", size: "18px" },
    props,
  );
  const [local, rest] = splitProps(merged, [
    "class",
    "style",
    "onClick",
    "color",
    "size",
    "disabled",
    "checked",
    "onCheckedChange",
    "children",
  ]);

  const handleClick: JSX.EventHandler<HTMLDivElement, MouseEvent> = (event) => {
    callEventHandler(local.onClick, event);
    if (!event.defaultPrevented && !local.disabled) {
      local.onCheckedChange?.(!local.checked);
    }
  };

  return (
    <div
      {...rest}
      onClick={handleClick}
      class={local.class}
      style={mergeStyle(local.style, {
        "--elmethis-scoped-color": local.color,
        "--elmethis-scoped-padding": "2px",
        "--elmethis-scoped-size": local.size,
        "--elmethis-scoped-width":
          "calc(var(--elmethis-scoped-size) * 2 + var(--elmethis-scoped-padding) * 2)",
      })}
    >
      <input
        class={styles.switch}
        type="checkbox"
        checked={local.checked}
        disabled={local.disabled}
        readOnly
      />
      <div
        class={clsx(
          styles.bar,
          local.checked && styles.checked,
          local.disabled && styles.disabled,
        )}
      >
        <div
          class={clsx(
            styles.circle,
            local.checked && styles.checked,
            local.disabled && styles.disabled,
          )}
        />
      </div>
    </div>
  );
};
