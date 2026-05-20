import { component$, PropsOf, Slot, useContext } from "@qwik.dev/core";
import styles from "./elm-table-cell.module.css";
import { HasRowHeaderContext, TableSectionContext } from "./table-context";

export interface ElmTableCellProps extends PropsOf<"td"> {
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

export const ElmTableCell = component$<ElmTableCellProps>((props) => {
  const {
    class: className,
    style,
    isHeader = false,
    columnIndex,
    text,
    scope: scopeOverride,
    ...rest
  } = props;

  const section = useContext(TableSectionContext, "body");
  const hasRowHeader = useContext(HasRowHeaderContext, { value: false });

  const inHead = section === "head";
  const isRowHeader =
    !inHead && !isHeader && columnIndex === 0 && hasRowHeader.value;
  const renderAsTh = inHead || isHeader || isRowHeader;

  const scope =
    scopeOverride ?? (inHead ? "col" : isRowHeader ? "row" : undefined);

  return renderAsTh ? (
    <th
      class={[styles.common, styles.th, className]}
      style={style}
      scope={scope}
      {...rest}
    >
      {text != null ? text : <Slot />}
    </th>
  ) : (
    <td class={[styles.common, styles.td, className]} style={style} {...rest}>
      {text != null ? text : <Slot />}
    </td>
  );
});
