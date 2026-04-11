import React from "react";

import "@styles/global.css";
import styles from "./ElmMdiIcon.module.css";

export interface ElmMdiIconCSSVariables {
  "--elmethis-color"?: React.CSSProperties["color"];
  "--elmethis-color-light"?: React.CSSProperties["color"];
  "--elmethis-color-dark"?: React.CSSProperties["color"];
}

export interface ElmMdiIconProps {
  style?: React.CSSProperties & ElmMdiIconCSSVariables;

  d: string;

  size?: number | string;
  color?: string;
  colorLight?: string;
  colorDark?: string;
}

export const ElmMdiIcon = (props: ElmMdiIconProps) => {
  return (
    <div className={styles["elm-mdi-icon"]} style={props.style}>
      <svg
        width={props.size}
        height={props.size}
        viewBox="0 0 24 24"
        focusable="false"
        role="img"
        className={styles.icon}
      >
        <path fill="currentColor" d={props.d} />
      </svg>
    </div>
  );
};
