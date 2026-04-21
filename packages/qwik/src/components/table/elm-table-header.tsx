import {
  component$,
  Slot,
  createContextId,
  useContextProvider,
  type CSSProperties,
} from "@builder.io/qwik";
import styles from "./elm-table-header.module.scss";

export const HasHeaderContext = createContextId<boolean>("HasHeaderContext");

export interface ElmTableHeaderProps {
  class?: string;

  style?: CSSProperties;
}

export const ElmTableHeader = component$<ElmTableHeaderProps>(({ class: className, style }) => {
  useContextProvider(HasHeaderContext, true);

  return (
    <thead class={[styles.thead, className]} style={style}>
      <Slot />
    </thead>
  );
});
