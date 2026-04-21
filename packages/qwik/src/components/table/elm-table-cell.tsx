import { component$, Slot, useContext, type CSSProperties } from "@builder.io/qwik";
import styles from "./elm-table-cell.module.scss";
import { HasHeaderContext } from "./elm-table-header";

export interface ElmTableCellProps {
  class?: string;

  style?: CSSProperties;

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
  const { class: className, style, hasHeader = false, text } = props;
  const hasHeaderInjected = useContext(HasHeaderContext, false);

  const isHeader = hasHeader || (hasHeaderInjected as boolean | undefined);

  return (
    <>
      {isHeader ? (
        <th class={[styles.common, styles.th, className]} style={style}>{text ? text : <Slot />}</th>
      ) : (
        <td class={[styles.common, styles.td, className]} style={style}>{text ? text : <Slot />}</td>
      )}
    </>
  );
});
