import { createContextId } from "@qwik.dev/core";

/**
 * Exposes whether the surrounding `<ElmTable>` was rendered with
 * `hasRowHeader`. Cells read this to decide whether to self-promote the
 * first column to `<th scope="row">`.
 *
 * Typed as the structural `{ value }` shape rather than `Signal<boolean>` so
 * `useContext(ctx, { value: false })` can supply a non-reactive default for
 * cells rendered outside an `<ElmTable>` ancestor (e.g. in isolated tests).
 * Qwik's `Signal<boolean>` satisfies this shape, so the live provider in
 * `ElmTable` still wires reactivity.
 */
export const HasRowHeaderContext = createContextId<{ readonly value: boolean }>(
  "elm.table.HasRowHeader",
);

/**
 * Which section of the table a row/cell lives in. `ElmTableHeader` and
 * `ElmTableBody` provide this so `ElmTableCell` can render `<th>` vs `<td>`
 * without each cell needing an explicit prop.
 *
 * `"foot"` is reserved for a future `<ElmTableFoot>`.
 */
export type TableSection = "head" | "body" | "foot";
export const TableSectionContext =
  createContextId<TableSection>("elm.table.Section");
