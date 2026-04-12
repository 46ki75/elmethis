import React from "react";

import "@styles/global.css";
import styles from "./ElmDivider.module.css";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmDividerCSSVariables = Pick<
  ElmethisCSSVariables,
  | "--elmethis-margin-block"
  | "--elmethis-text-color-light"
  | "--elmethis-text-color-dark"
>;

export interface ElmDividerProps {
  style?: React.CSSProperties & ElmDividerCSSVariables;

  /**
   * The margin of the divider.
   */
  margin?: React.CSSProperties["marginBlock"];
}

export const ElmDivider = (props: ElmDividerProps) => {
  return (
    <hr
      className={styles.divider}
      style={
        {
          "--elmethis-margin-block": props.margin,
          ...props.style,
        } as React.CSSProperties
      }
    />
  );
};
