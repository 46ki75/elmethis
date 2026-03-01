import { component$, Slot, useContext } from "@builder.io/qwik";
import styles from "./elm-table-row.module.scss";
import { HasRowHeaderContext } from "./elm-table";

export interface ElmTableRowProps {}

export const ElmTableRow = component$<ElmTableRowProps>(() => {
  const hasRowHeader = useContext(HasRowHeaderContext);

  return (
    <tr class={[styles.tr, hasRowHeader.value && styles["has-row-header"]]}>
      <Slot />
    </tr>
  );
});
