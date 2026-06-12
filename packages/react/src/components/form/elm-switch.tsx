import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { clsx } from "clsx";

import styles from "./elm-switch.module.css";

// Display/form dual-use component: intentionally does NOT adopt
// `useControllableState`. Used both as a stateful form input and as a passive
// indicator reflecting upstream state, so a direct controlled `checked` /
// `onCheckedChange` binding is preferred over the controlled/uncontrolled split.
export interface ElmSwitchProps extends Omit<
  ComponentPropsWithoutRef<"div">,
  "onChange"
> {
  /**
   * The color of the switch when checked.
   */
  color?: string;

  /**
   * The size of the switch.
   */
  size?: string;

  /**
   * Whether the switch is disabled.
   */
  disabled?: boolean;

  /**
   * Controlled checked state. The parent owns the state.
   */
  checked: boolean;

  /**
   * Called with the next checked value when the switch is toggled.
   */
  onCheckedChange?: (checked: boolean) => void;
}

export const ElmSwitch = ({
  className,
  style,
  color,
  size,
  disabled,
  checked,
  onCheckedChange,
  ...props
}: ElmSwitchProps) => {
  const resolvedColor = color ?? "var(--elmethis-color-primary)";
  const resolvedSize = size ?? "18px";

  return (
    <div
      onClick={() => {
        if (!disabled) {
          onCheckedChange?.(!checked);
        }
      }}
      className={className}
      style={
        {
          "--elmethis-scoped-color": resolvedColor,
          "--elmethis-scoped-padding": "2px",
          "--elmethis-scoped-size": resolvedSize,
          "--elmethis-scoped-width":
            "calc(var(--elmethis-scoped-size) * 2 + var(--elmethis-scoped-padding) * 2)",
          ...style,
        } as CSSProperties
      }
      {...props}
    >
      <input
        className={styles.switch}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        readOnly
      />
      <div
        className={clsx(
          styles.bar,
          checked && styles.checked,
          disabled && styles.disabled,
        )}
      >
        <div
          className={clsx(
            styles.circle,
            checked && styles.checked,
            disabled && styles.disabled,
          )}
        ></div>
      </div>
    </div>
  );
};
