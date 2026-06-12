import type { ComponentPropsWithoutRef, CSSProperties } from "react";
import { useContext } from "react";
import { clsx } from "clsx";

import styles from "./elm-table-cell.module.css";
import { HasRowHeaderContext, TableSectionContext } from "./table-context";

export interface ElmTableCellProps extends ComponentPropsWithoutRef<"td"> {
  /**
   * Force this cell to render as a `<th>`. Use for cells that are headers
   * but live outside `<ElmTableHeader>` (e.g. a mid-table grouping row).
   * Cells inside `<ElmTableHeader>` are promoted automatically.
   */
  isHeader?: boolean;

  /**
   * 0-based column index within the row. When the surrounding `<ElmTable>`
   * has `hasRowHeader`, the cell at `columnIndex === 0` is promoted to
   * `<th scope="row">` for accessibility. Hand-authored callers can omit
   * this; renderers (e.g. the A2UI catalog) should pass their iteration
   * index through.
   */
  columnIndex?: number;

  /** Convenience for plain-text cells. Equivalent to passing children. */
  text?: string;
}

export const ElmTableCell = ({
  className,
  style,
  isHeader = false,
  columnIndex,
  text,
  scope: scopeOverride,
  children,
  ...rest
}: ElmTableCellProps) => {
  const section = useContext(TableSectionContext);
  const hasRowHeader = useContext(HasRowHeaderContext);

  const inHead = section === "head";
  const isRowHeader =
    !inHead && !isHeader && columnIndex === 0 && hasRowHeader.value;
  const renderAsTh = inHead || isHeader || isRowHeader;

  const scope =
    scopeOverride ?? (inHead ? "col" : isRowHeader ? "row" : undefined);

  const content = text != null ? text : children;

  return renderAsTh ? (
    <th
      className={clsx(styles["elm-table-cell"], styles.th, className)}
      style={style as CSSProperties}
      scope={scope}
      {...rest}
    >
      {content}
    </th>
  ) : (
    <td
      className={clsx(styles["elm-table-cell"], styles.td, className)}
      style={style as CSSProperties}
      {...rest}
    >
      {content}
    </td>
  );
};
