import { component$, Slot, useContext, type CSSProperties } from "@builder.io/qwik";
import styles from "./elm-table-row.module.scss";
import { HasRowHeaderContext } from "./elm-table";

export interface ElmTableRowProps {
  class?: string;

  style?: CSSProperties;
}

export const ElmTableRow = component$<ElmTableRowProps>(({ class: className, style }) => {
  const hasRowHeader = useContext(HasRowHeaderContext);

  return (
    <tr class={[styles.tr, hasRowHeader.value && styles["has-row-header"], className]} style={style}>
      <Slot />
    </tr>
  );
});
