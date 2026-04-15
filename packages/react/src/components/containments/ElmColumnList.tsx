import React from "react";

import "@styles/global.css";
import styles from "./ElmColumnList.module.css";

export interface ElmColumnListCSSVariables {}

export interface ElmColumnListProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmColumnListCSSVariables;

  className?: string;
}

export const ElmColumnList = (props: ElmColumnListProps) => {
  return (
    <div
      className={[styles["column-list"], props.className]
        .filter(Boolean)
        .join(" ")}
      style={props.style}
    >
      {props.children}
    </div>
  );
};
