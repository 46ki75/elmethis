import React, { useCallback } from "react";

import "@styles/global.css";
import styles from "./ElmCheckbox.module.css";

export interface ElmCheckboxCSSVariables {}

export interface ElmCheckboxProps {
  style?: React.CSSProperties & ElmCheckboxCSSVariables;

  /** The label displayed. */
  label: string;

  /** Whether the checkbox is checked. */
  checked?: boolean;

  /** Whether the checkbox is in a loading state. */
  loading?: boolean;

  /** Whether the checkbox is disabled. */
  disable?: boolean;

  /** Called when the checked state changes. */
  onChange?: (checked: boolean) => void;
}

export const ElmCheckbox = ({
  loading = false,
  disable = false,
  checked = false,
  ...props
}: ElmCheckboxProps) => {
  const { onChange } = props;

  const toggleCheck = useCallback(() => {
    if (!loading && !disable && onChange) {
      onChange(!checked);
    }
  }, [loading, disable, checked, onChange]);

  const containerClass = [
    styles.container,
    disable ? styles["container-disable"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  const rectClass = [
    styles.rect,
    checked ? styles["rect-checked"] : "",
    loading ? styles["rect-loading"] : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={containerClass} style={props.style} onClick={toggleCheck}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
        <svg width="24" height="24" className={styles.checkbox}>
          <circle
            cx="0"
            cy="0"
            r="2"
            className={styles.loading}
            style={{ opacity: loading ? 1 : 0 }}
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
            className={styles.loading}
            style={{ opacity: loading ? 1 : 0 }}
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
            className={rectClass}
            strokeWidth="0.8"
          />

          {checked && (
            <polyline
              className={styles["check-line"]}
              points="5,12 10,17 19,8"
              strokeWidth="1.5"
              fill="transparent"
            />
          )}

          <line
            x1="0"
            y1="1"
            x2="4"
            y2="1"
            strokeWidth="2"
            fill="transparent"
          />
          <line
            x1="4"
            y1="0"
            x2="24"
            y2="0"
            strokeWidth="1"
            fill="transparent"
          />
          <line
            x1="0"
            y1="4"
            x2="0"
            y2="16"
            strokeWidth="1"
            fill="transparent"
          />
          <line
            x1="0"
            y1="18"
            x2="0"
            y2="20"
            strokeWidth="1"
            fill="transparent"
          />
          <line
            x1="0"
            y1="24"
            x2="20"
            y2="24"
            strokeWidth="1"
            fill="transparent"
          />
          <line
            x1="20"
            y1="23"
            x2="24"
            y2="23"
            strokeWidth="1.5"
            fill="transparent"
          />
          <line
            x1="24"
            y1="4"
            x2="24"
            y2="20"
            style={{ strokeWidth: 1 }}
            fill="transparent"
          />
        </svg>
        <span>{props.label}</span>
      </div>
    </div>
  );
};
