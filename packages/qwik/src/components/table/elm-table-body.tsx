import { component$, Slot, useContextProvider, type CSSProperties } from "@builder.io/qwik";
import { HasHeaderContext } from "./elm-table-header";

export interface ElmTableBodyProps {
  class?: string;

  style?: CSSProperties;
}

export const ElmTableBody = component$<ElmTableBodyProps>(({ class: className, style }) => {
  useContextProvider(HasHeaderContext, false);

  return (
    <tbody class={className} style={style}>
      <Slot />
    </tbody>
  );
});
