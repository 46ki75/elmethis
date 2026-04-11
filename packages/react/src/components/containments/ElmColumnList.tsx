import React from "react";

import "@styles/global.css";
import styles from "./ElmColumnList.module.css";

export interface ElmColumnListCSSVariables {}

export interface ElmColumnListProps extends React.PropsWithChildren {
  style?: React.CSSProperties & ElmColumnListCSSVariables;
}

export const ElmColumnList = (props: ElmColumnListProps) => {
  return (
    <div className={styles["column-list"]} style={props.style}>
      {props.children}
    </div>
  );
};
