import React, { useContext } from "react";

import "@styles/global.css";
import styles from "./ElmTableCell.module.css";

import { HasHeaderContext } from "./TableContext";

export interface ElmTableCellProps extends React.PropsWithChildren {
  style?: React.CSSProperties;

  className?: string;

  /**
   * Whether the cell is a header cell.
   */
  hasHeader?: boolean;

  /**
   * The text content of the cell.
   * If not provided, the cell will render its children as content.
   */
  text?: string;
}

export const ElmTableCell = ({
  children,
  style,
  hasHeader = false,
  text,
  className,
}: ElmTableCellProps) => {
  const hasHeaderInjected = useContext(HasHeaderContext);
  const isHeader = hasHeader || hasHeaderInjected;
  const Tag = isHeader ? "th" : "td";

  return (
    <Tag
      className={[styles.common, isHeader ? styles.th : styles.td, className]
        .filter(Boolean)
        .join(" ")}
      style={style}
    >
      {text != null ? text : children}
    </Tag>
  );
};
