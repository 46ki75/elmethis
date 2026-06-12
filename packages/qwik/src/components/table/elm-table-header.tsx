import { component$, PropsOf, Slot, useContextProvider } from "@qwik.dev/core";
import styles from "./elm-table-header.module.css";
import { TableSectionContext } from "./table-context";

export type ElmTableHeaderProps = PropsOf<"thead">;

export const ElmTableHeader = component$<PropsOf<"thead">>(
  ({ class: className, ...props }) => {
    useContextProvider(TableSectionContext, "head");

    return (
      <thead class={[styles["elm-table-header"], className]} {...props}>
        <Slot />
      </thead>
    );
  },
);
