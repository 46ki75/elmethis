import React, { useCallback } from "react";

import "@styles/global.css";
import styles from "./ElmSwitch.module.css";

export interface ElmSwitchCSSVariables {
  "--color"?: string;
  "--padding"?: string;
  "--size"?: string;
  "--width"?: string;
}

export interface ElmSwitchProps {
  style?: React.CSSProperties & ElmSwitchCSSVariables;

  className?: string;

  /** The color of the switch when checked. */
  color?: string;

  /** The size of the switch. */
  size?: React.CSSProperties["width"];

  /** Whether the switch is checked. */
  checked?: boolean;

  /** Whether the switch is disabled. */
  disabled?: boolean;

  /** Called when the checked state changes. */
  onChange?: (checked: boolean) => void;
}

export const ElmSwitch = ({
  color = "#bfa056",
  size = "18px",
  disabled = false,
  checked = false,
  ...props
}: ElmSwitchProps) => {
  const { onChange } = props;

  const handleClick = useCallback(() => {
    if (!disabled && onChange) {
      onChange(!checked);
    }
  }, [disabled, checked, onChange]);

  const barClass = [
    styles.bar,
    checked ? styles["bar-checked"] : "",
    disabled ? styles["bar-disabled"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  const circleClass = [
    styles.circle,
    checked ? styles["circle-checked"] : "",
    disabled ? styles["circle-disabled"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={props.className}
      onClick={handleClick}
      style={
        {
          "--color": color,
          "--padding": "2px",
          "--size": size,
          "--width": `calc(${size} * 2 + 2px * 2)`,
          ...props.style,
        } as React.CSSProperties
      }
    >
      <input
        className={styles.switch}
        type="checkbox"
        checked={checked}
        disabled={disabled}
        readOnly
      />
      <div className={barClass}>
        <div className={circleClass}></div>
      </div>
    </div>
  );
};
