import React from "react";

import "@styles/global.css";
import styles from "./ElmMdiIcon.module.css";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmMdiIconCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-color-primary" | "--elmethis-color-primary-dark"
> & {
  "--elmethis-scoped-color"?: React.CSSProperties["color"];
  "--elmethis-scoped-color-dark"?: React.CSSProperties["color"];
};

export interface ElmMdiIconProps {
  style?: React.CSSProperties & ElmMdiIconCSSVariables;

  className?: string;

  d: string;

  useThemeColor?: boolean;

  size?: number | string;
  color?: string;
  colorLight?: string;
  colorDark?: string;
}

export const ElmMdiIcon = (props: ElmMdiIconProps) => {
  return (
    <div className={props.className} style={props.style}>
      <svg
        width={props.size || "1.25rem"}
        height={props.size || "1.25rem"}
        viewBox="0 0 24 24"
        focusable="false"
        role="img"
      >
        <path
          style={{
            "--elmethis-scoped-color": props.colorLight ?? props.color,
            "--elmethis-scoped-color-dark": props.colorDark ?? props.color,
            ...props.style,
          }}
          className={
            props.useThemeColor ? styles["icon-theme-color"] : styles.icon
          }
          fill="currentColor"
          d={props.d}
        />
      </svg>
    </div>
  );
};
