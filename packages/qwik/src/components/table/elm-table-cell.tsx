import { component$, Slot, useContext } from "@builder.io/qwik";
import styles from "./elm-table-cell.module.scss";
import { HasHeaderContext } from "./elm-table-header";

export interface ElmTableCellProps {
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

export const ElmTableCell = component$<ElmTableCellProps>((props) => {
  const { hasHeader = false, text } = props;
  const hasHeaderInjected = useContext(HasHeaderContext, false);

  const isHeader = hasHeader || hasHeaderInjected;

  const CellTag = isHeader ? "th" : ("td" as any);

  return (
    <CellTag class={[styles.common, isHeader ? styles.th : styles.td]}>
      {text ? text : <Slot />}
    </CellTag>
  );
});
