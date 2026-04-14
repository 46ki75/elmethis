import React from "react";

import "@styles/global.css";
import styles from "./ElmSpinner.module.css";

export interface ElmSpinnerCSSVariables {}

export interface ElmSpinnerProps {
  style?: React.CSSProperties & ElmSpinnerCSSVariables;

  className?: string;

  /**
   * Specifies the radius of the spinner circle.
   */
  radius?: number;

  /**
   * Specifies the stroke width of the spinner circle.
   */
  weight?: number;
}

export const ElmSpinner = (props: ElmSpinnerProps) => {
  const { radius = 16, weight = 2, style } = props;

  return (
    <svg
      className={props.className}
      height={radius * 2}
      width={radius * 2}
      style={style}
    >
      <circle
        className={styles.circle}
        cx={radius}
        cy={radius}
        r={radius - weight}
        fill="transparent"
        strokeWidth={weight}
      />
    </svg>
  );
};
