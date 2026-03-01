import {
  component$,
  Slot,
  createContextId,
  useContextProvider,
  useStylesScoped$,
} from "@builder.io/qwik";
import styles from "./elm-table-header.scoped.scss?inline";

export const HasHeaderContext = createContextId<boolean>("HasHeaderContext");

export type ElmTableHeaderProps = object;

export const ElmTableHeader = component$<ElmTableHeaderProps>(() => {
  useStylesScoped$(styles);
  useContextProvider(HasHeaderContext, true);

  return (
    <thead class="thead">
      <Slot />
    </thead>
  );
});
