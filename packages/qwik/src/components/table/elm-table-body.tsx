import { component$, PropsOf, Slot, useContextProvider } from "@qwik.dev/core";
import { TableSectionContext } from "./table-context";

export type ElmTableBodyProps = PropsOf<"tbody">;

export const ElmTableBody = component$<PropsOf<"tbody">>(
  ({ class: className, ...props }) => {
    useContextProvider(TableSectionContext, "body");

    return (
      <tbody class={className} {...props}>
        <Slot />
      </tbody>
    );
  },
);
