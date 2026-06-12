import { component$, PropsOf, Slot } from "@qwik.dev/core";
import styles from "./elm-table-row.module.css";

export type ElmTableRowProps = PropsOf<"tr">;

export const ElmTableRow = component$<PropsOf<"tr">>(
  ({ class: className, ...props }) => {
    return (
      <tr class={[styles["elm-table-row"], className]} {...props}>
        <Slot />
      </tr>
    );
  },
);
