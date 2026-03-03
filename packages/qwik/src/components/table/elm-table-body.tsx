import { component$, Slot, useContextProvider } from "@builder.io/qwik";
import { HasHeaderContext } from "./elm-table-header";

export type ElmTableBodyProps = object;

export const ElmTableBody = component$<ElmTableBodyProps>(() => {
  useContextProvider(HasHeaderContext, false);

  return (
    <tbody>
      <Slot />
    </tbody>
  );
});
