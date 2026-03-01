import { component$, Slot, useContextProvider } from "@builder.io/qwik";
import { HasHeaderContext } from "./elm-table-header";

export interface ElmTableBodyProps {}

export const ElmTableBody = component$<ElmTableBodyProps>(() => {
  useContextProvider(HasHeaderContext, false);

  return (
    <tbody>
      <Slot />
    </tbody>
  );
});
