import {
  component$,
  PropsOf,
  Slot,
  useContextProvider,
} from "@qwik.dev/core";
import { HasHeaderContext } from "./elm-table-header";

export type ElmTableBodyProps = PropsOf<"tbody">;

export const ElmTableBody = component$<PropsOf<"tbody">>(
  ({ class: className, ...props }) => {
    useContextProvider(HasHeaderContext, false);

    return (
      <tbody class={className} {...props}>
        <Slot />
      </tbody>
    );
  },
);
