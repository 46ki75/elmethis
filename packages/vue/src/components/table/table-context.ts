import type { InjectionKey, Ref } from "vue";

/**
 * Exposes whether the surrounding `<ElmTable>` was rendered with
 * `hasRowHeader`. Cells read this to decide whether to self-promote the first
 * column to `<th scope="row">`.
 *
 * Provided as a `Ref<boolean>` (a `computed` from `ElmTable`) so reactivity is
 * wired through; cells `inject` with a `ref(false)` default for cells rendered
 * outside an `<ElmTable>` ancestor (e.g. in isolated tests).
 */
export const HasRowHeaderContext: InjectionKey<Readonly<Ref<boolean>>> = Symbol(
  "elm.table.HasRowHeader",
);

/**
 * Which section of the table a row/cell lives in. `ElmTableHeader` and
 * `ElmTableBody` provide this so `ElmTableCell` can render `<th>` vs `<td>`
 * without each cell needing an explicit prop.
 *
 * `"foot"` is reserved for a future `<ElmTableFoot>`. Cells `inject` with a
 * `"body"` default to match cells used outside a section.
 */
export type TableSection = "head" | "body" | "foot";
export const TableSectionContext: InjectionKey<TableSection> =
  Symbol("elm.table.Section");
