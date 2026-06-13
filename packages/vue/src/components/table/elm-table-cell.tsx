import {
  defineComponent,
  inject,
  ref,
  type PropType,
  type StyleValue,
  type TdHTMLAttributes,
} from "vue";
import { clsx } from "clsx";

import styles from "./elm-table-cell.module.css";
import { HasRowHeaderContext, TableSectionContext } from "./table-context";

export interface ElmTableCellProps extends TdHTMLAttributes {
  /**
   * Force this cell to render as a `<th>`. Use for cells that are headers but
   * live outside `<ElmTableHeader>` (e.g. a mid-table grouping row). Cells
   * inside `<ElmTableHeader>` are promoted automatically.
   */
  isHeader?: boolean;

  /**
   * 0-based column index within the row. When the surrounding `<ElmTable>` has
   * `hasRowHeader`, the cell at `columnIndex === 0` is promoted to
   * `<th scope="row">` for accessibility.
   */
  columnIndex?: number;

  /** Convenience for plain-text cells. Equivalent to passing children. */
  text?: string;
}

export const ElmTableCell = defineComponent({
  name: "ElmTableCell",
  inheritAttrs: false,
  props: {
    isHeader: { type: Boolean, default: false },
    columnIndex: { type: Number, default: undefined },
    text: { type: String, default: undefined },
    scope: { type: String as PropType<string>, default: undefined },
  },
  setup(props, { attrs, slots }) {
    const section = inject(TableSectionContext, "body");
    const hasRowHeader = inject(HasRowHeaderContext, ref(false));

    return () => {
      const {
        class: className,
        style,
        ...rest
      } = attrs as Record<string, unknown>;

      const inHead = section === "head";
      const isRowHeader =
        !inHead &&
        !props.isHeader &&
        props.columnIndex === 0 &&
        hasRowHeader.value;
      const renderAsTh = inHead || props.isHeader || isRowHeader;

      const scope =
        props.scope ?? (inHead ? "col" : isRowHeader ? "row" : undefined);

      const content = props.text != null ? props.text : slots.default?.();

      return renderAsTh ? (
        <th
          class={clsx(
            styles["elm-table-cell"],
            styles.th,
            className as string | undefined,
          )}
          style={style as StyleValue}
          scope={scope}
          {...rest}
        >
          {content}
        </th>
      ) : (
        <td
          class={clsx(
            styles["elm-table-cell"],
            styles.td,
            className as string | undefined,
          )}
          style={style as StyleValue}
          {...rest}
        >
          {content}
        </td>
      );
    };
  },
});
