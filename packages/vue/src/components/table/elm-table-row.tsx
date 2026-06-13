import { defineComponent, type HTMLAttributes } from "vue";
import { clsx } from "clsx";

import styles from "./elm-table-row.module.css";

export type ElmTableRowProps = HTMLAttributes;

export const ElmTableRow = defineComponent({
  name: "ElmTableRow",
  setup(_, { slots }) {
    // Fallthrough class merges with the binding below.
    return () => (
      <tr class={clsx(styles["elm-table-row"])}>{slots.default?.()}</tr>
    );
  },
});
