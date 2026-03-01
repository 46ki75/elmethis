import {
  component$,
  Slot,
  createContextId,
  useContextProvider,
} from "@builder.io/qwik";
import styles from "./elm-table-header.module.scss";

export const HasHeaderContext = createContextId<boolean>("HasHeaderContext");

export interface ElmTableHeaderProps {}

export const ElmTableHeader = component$<ElmTableHeaderProps>(() => {
  useContextProvider(HasHeaderContext, true);

  return (
    <thead class={styles.thead}>
      <Slot />
    </thead>
  );
});
