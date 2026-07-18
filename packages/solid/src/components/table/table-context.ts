import { createContext, type Accessor } from "solid-js";

/** Whether the surrounding table promotes its first body column to row headers. */
export const HasRowHeaderContext = createContext<Accessor<boolean>>(
  () => false,
);

/** The native table section containing a row or cell. */
export type TableSection = "head" | "body" | "foot";

export const TableSectionContext = createContext<Accessor<TableSection>>(
  (): TableSection => "body",
);
