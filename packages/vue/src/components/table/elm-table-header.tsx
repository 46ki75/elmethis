import { defineComponent, provide, type HTMLAttributes } from "vue";
import { clsx } from "clsx";

import styles from "./elm-table-header.module.css";
import { TableSectionContext } from "./table-context";

export type ElmTableHeaderProps = HTMLAttributes;

export const ElmTableHeader = defineComponent({
  name: "ElmTableHeader",
  setup(_, { slots }) {
    provide(TableSectionContext, "head");
    // Fallthrough class merges with the binding below.
    return () => (
      <thead class={clsx(styles["elm-table-header"])}>
        {slots.default?.()}
      </thead>
    );
  },
});
