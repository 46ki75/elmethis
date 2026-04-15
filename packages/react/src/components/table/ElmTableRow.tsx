import React, { useContext } from "react";

import "@styles/global.css";
import styles from "./ElmTableRow.module.css";

import { HasRowHeaderContext } from "./TableContext";

export interface ElmTableRowProps extends React.PropsWithChildren {
  style?: React.CSSProperties;

  className?: string;
}

export const ElmTableRow = ({
  children,
  style,
  className,
}: ElmTableRowProps) => {
  const hasRowHeader = useContext(HasRowHeaderContext);

  return (
    <tr
      className={[
        styles.tr,
        hasRowHeader ? styles["has-row-header"] : undefined,
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {children}
    </tr>
  );
};
