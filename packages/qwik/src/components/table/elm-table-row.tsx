import {
  component$,
  Slot,
  useContext,
  useStylesScoped$,
} from "@builder.io/qwik";
import styles from "./elm-table-row.scoped.scss?inline";
import { HasRowHeaderContext } from "./elm-table";

export type ElmTableRowProps = object;

export const ElmTableRow = component$<ElmTableRowProps>(() => {
  useStylesScoped$(styles);
  const hasRowHeader = useContext(HasRowHeaderContext);

  return (
    <tr class={["tr", hasRowHeader.value && "has-row-header"]}>
      <Slot />
    </tr>
  );
});
