import {
  component$,
  PropsOf,
  Slot,
  createContextId,
  useContextProvider,
} from "@builder.io/qwik";
import styles from "./elm-table-header.module.css";

export const HasHeaderContext = createContextId<boolean>("HasHeaderContext");

export type ElmTableHeaderProps = PropsOf<"thead">;

export const ElmTableHeader = component$<PropsOf<"thead">>(
  ({ class: className, ...props }) => {
    useContextProvider(HasHeaderContext, true);

    return (
      <thead class={[styles.thead, className]} {...props}>
        <Slot />
      </thead>
    );
  },
);
