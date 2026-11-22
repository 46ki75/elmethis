import { dynamic, type JSX } from "@solidjs/web";
import { createMemo, omit, useContext } from "solid-js";
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
  const rest = omit(
    props,
    "class",
    "children",
    "isHeader",
    "columnIndex",
    "text",
    "scope",
  );
  const section = useContext(TableSectionContext);
  const hasRowHeader = useContext(HasRowHeaderContext);
  const inHead = createMemo(() => section() === "head");
  const isRowHeader = createMemo(
    () =>
      !inHead() && !props.isHeader && props.columnIndex === 0 && hasRowHeader(),
  );
  const renderAsHeader = createMemo(
    () => inHead() || Boolean(props.isHeader) || isRowHeader(),
  );
  const scope = createMemo(() =>
    renderAsHeader()
      ? (props.scope ?? (inHead() ? "col" : isRowHeader() ? "row" : undefined))
      : undefined,
  );

  const Cell = dynamic(() => (renderAsHeader() ? "th" : "td"));
  return (
    <Cell
      {...rest}
      class={clsx(
        styles["elm-table-cell"],
        renderAsHeader() ? styles.th : styles.td,
        props.class,
      )}
      scope={scope()}
    >
      {props.text != null ? props.text : props.children}
    </Cell>
  );
};
