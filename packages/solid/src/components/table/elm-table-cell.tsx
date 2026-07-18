import { createMemo, splitProps, useContext, type JSX } from "solid-js";
import { Dynamic } from "solid-js/web";
import { clsx } from "clsx";

import styles from "./elm-table-cell.module.css";
import { HasRowHeaderContext, TableSectionContext } from "./table-context";

export interface ElmTableCellProps extends JSX.TdHTMLAttributes<HTMLTableCellElement> {
  /** Force this cell to render as a native header cell. */
  isHeader?: boolean;

  /** The zero-based column index used for first-column row-header promotion. */
  columnIndex?: number;

  /** Plain-text content that takes precedence over children when provided. */
  text?: string;
}

export const ElmTableCell = (props: ElmTableCellProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "isHeader",
    "columnIndex",
    "text",
    "scope",
  ]);
  const section = useContext(TableSectionContext);
  const hasRowHeader = useContext(HasRowHeaderContext);
  const inHead = createMemo(() => section() === "head");
  const isRowHeader = createMemo(
    () =>
      !inHead() && !local.isHeader && local.columnIndex === 0 && hasRowHeader(),
  );
  const renderAsHeader = createMemo(
    () => inHead() || Boolean(local.isHeader) || isRowHeader(),
  );
  const scope = createMemo(() =>
    renderAsHeader()
      ? (local.scope ?? (inHead() ? "col" : isRowHeader() ? "row" : undefined))
      : undefined,
  );

  return (
    <Dynamic
      component={renderAsHeader() ? "th" : "td"}
      {...rest}
      class={clsx(
        styles["elm-table-cell"],
        renderAsHeader() ? styles.th : styles.td,
        local.class,
      )}
      scope={scope()}
    >
      {local.text != null ? local.text : local.children}
    </Dynamic>
  );
};
