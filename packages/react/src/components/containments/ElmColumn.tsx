import React from "react";

import "@styles/global.css";
import styles from "./ElmColumn.module.css";

export interface ElmColumnCSSVariables {}

export interface ElmColumnProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmColumnCSSVariables;

  className?: string;
}

export const ElmColumn = (props: ElmColumnProps) => {
  return (
    <div
      className={[styles.column, props.className].filter(Boolean).join(" ")}
      style={props.style}
    >
      {props.children}
    </div>
  );
};
