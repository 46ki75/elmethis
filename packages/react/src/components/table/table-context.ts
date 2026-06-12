import { createContext } from "react";

/**
 * Exposes whether the surrounding `<ElmTable>` was rendered with
 * `hasRowHeader`. Cells read this to decide whether to self-promote the
 * first column to `<th scope="row">`.
 *
 * Typed as the structural `{ value }` shape rather than a bare `boolean` so the
 * provider can hand down a stable object and `useContext` falls back to a
 * non-reactive default for cells rendered outside an `<ElmTable>` ancestor
 * (e.g. in isolated tests). The `createContext` default value supplies that
 * `{ value: false }` fallback.
 */
export const HasRowHeaderContext = createContext<{ readonly value: boolean }>({
  value: false,
});

/**
 * Which section of the table a row/cell lives in. `ElmTableHeader` and
 * `ElmTableBody` provide this so `ElmTableCell` can render `<th>` vs `<td>`
 * without each cell needing an explicit prop.
 *
 * `"foot"` is reserved for a future `<ElmTableFoot>`. The `createContext`
 * default (`"body"`) matches the fallback cells used outside a section.
 */
export type TableSection = "head" | "body" | "foot";
export const TableSectionContext = createContext<TableSection>("body");
