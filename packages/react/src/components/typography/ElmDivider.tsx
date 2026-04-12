import React from "react";

import "@styles/global.css";
import styles from "./ElmDivider.module.css";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmDividerCSSVariables = Pick<
  ElmethisCSSVariables,
  | "--elmethis-margin-block-start"
  | "--elmethis-text-color-light"
  | "--elmethis-text-color-dark"
>;

export interface ElmDividerProps {
  style?: React.CSSProperties & ElmDividerCSSVariables;
}

export const ElmDivider = (props: ElmDividerProps) => {
  return <hr className={styles.divider} style={props.style} />;
};
