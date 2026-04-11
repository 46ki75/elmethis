import React, { useContext } from "react";

import "@styles/global.css";
import styles from "./ElmTableRow.module.css";

import { HasRowHeaderContext } from "./TableContext";

export interface ElmTableRowProps extends React.PropsWithChildren {
  style?: React.CSSProperties;
}

export const ElmTableRow = ({ children, style }: ElmTableRowProps) => {
  const hasRowHeader = useContext(HasRowHeaderContext);

  return (
    <tr
      className={`${styles.tr} ${hasRowHeader ? styles["has-row-header"] : ""}`}
      style={style}
    >
      {children}
    </tr>
  );
};
