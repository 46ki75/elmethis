import React from "react";
import type { Property } from "csstype";

import "@styles/global.css";
import styles from "./ElmDotLoadingIcon.module.css";

export interface ElmDotLoadingIconCSSVariables {}

export interface ElmDotLoadingIconProps {
  style?: React.CSSProperties & ElmDotLoadingIconCSSVariables;

  /**
   * Specifies the color of the dot.
   *
   * e.g.) `'red'`, `'#ff0000'`, `'rgba(255, 0, 0, 0.5)'`
   */
  color?: Property.BackgroundColor;

  /**
   * Specifies the size of the dot.
   */
  size?: Property.Width<string | number>;
}

export const ElmDotLoadingIcon = (props: ElmDotLoadingIconProps) => {
  const { color, size = "64px", style } = props;

  return (
    <div
      className={styles.wrapper}
      style={{ width: size, height: size, ...style }}
    >
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          className={styles.dot}
          aria-hidden
          style={color ? { backgroundColor: color } : undefined}
        />
      ))}
    </div>
  );
};
