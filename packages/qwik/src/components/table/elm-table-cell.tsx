import {
  component$,
  Slot,
  useContext,
  useStylesScoped$,
} from "@builder.io/qwik";
import styles from "./elm-table-cell.scoped.scss?inline";
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
  useStylesScoped$(styles);
  const { hasHeader = false, text } = props;
  const hasHeaderInjected = useContext(HasHeaderContext, false);

  const isHeader = hasHeader || (hasHeaderInjected as boolean | undefined);

  return (
    <>
      {isHeader ? (
        <th class={["common", "th"]}>{text ? text : <Slot />}</th>
      ) : (
        <td class={["common", "td"]}>{text ? text : <Slot />}</td>
      )}
    </>
  );
});
