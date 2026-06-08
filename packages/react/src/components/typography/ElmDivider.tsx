import React from "react";

import "@styles/global.css";
import styles from "./ElmDivider.module.css";
import type { ElmethisCSSVariables } from "@styles/variables";

export type ElmDividerCSSVariables = Pick<
  ElmethisCSSVariables,
  "--elmethis-margin-block-start"
>;

export interface ElmDividerProps {
  style?: React.CSSProperties & ElmDividerCSSVariables;

  className?: string;
}

export const ElmDivider = (props: ElmDividerProps) => {
  return (
    <hr
      className={[styles.divider, props.className].filter(Boolean).join(" ")}
      style={props.style}
    />
  );
};
