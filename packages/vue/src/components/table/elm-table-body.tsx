import { defineComponent, provide, type HTMLAttributes } from "vue";

import { TableSectionContext } from "./table-context";

export type ElmTableBodyProps = HTMLAttributes;

export const ElmTableBody = defineComponent({
  name: "ElmTableBody",
  setup(_, { slots }) {
    provide(TableSectionContext, "body");
    return () => <tbody>{slots.default?.()}</tbody>;
  },
});
