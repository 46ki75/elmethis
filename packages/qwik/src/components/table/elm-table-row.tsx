import { component$, PropsOf, Slot, useContext } from "@qwik.dev/core";
import styles from "./elm-table-row.module.css";
import { HasRowHeaderContext } from "./elm-table";

export type ElmTableRowProps = PropsOf<"tr">;

export const ElmTableRow = component$<PropsOf<"tr">>(
  ({ class: className, ...props }) => {
    const hasRowHeader = useContext(HasRowHeaderContext);

    return (
      <tr
        class={[
          styles.tr,
          hasRowHeader.value && styles["has-row-header"],
          className,
        ]}
        {...props}
      >
        <Slot />
      </tr>
    );
  },
);
