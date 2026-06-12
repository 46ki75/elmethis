import { Fragment, type CSSProperties, type ReactNode } from "react";

/** Maps A2UI `justify` prop values to CSS `justify-content` values. */
export const justifyContentMap: Record<
  string,
  CSSProperties["justifyContent"]
> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  spaceBetween: "space-between",
  spaceAround: "space-around",
  spaceEvenly: "space-evenly",
  stretch: "stretch",
};

/** Maps A2UI `align` prop values to CSS `align-items` values. */
export const alignItemsMap: Record<string, CSSProperties["alignItems"]> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  stretch: "stretch",
};

/** Maps A2UI `fit` prop values to CSS `object-fit` values. */
export const objectFitMap: Record<string, CSSProperties["objectFit"]> = {
  contain: "contain",
  cover: "cover",
  fill: "fill",
  none: "none",
  scaleDown: "scale-down",
};

/**
 * Recursively renders a component's resolved `children`/child-list value.
 *
 * The `@a2ui/react` generic binder resolves a `children` field into either a
 * flat array of string ids (`["a", "b"]`) or, for data-driven list templates,
 * an array of `{ id, basePath }` nodes — one per row, each carrying its own
 * scoped data path. `buildChild` is the host-provided recursive renderer
 * (`(id, basePath?) => ReactNode`). This mirrors the package's internal,
 * unexported `ChildList` so block renderers stay declarative.
 */
export function renderChildList(
  childList: unknown,
  buildChild: (id: string, basePath?: string) => ReactNode,
): ReactNode {
  if (!Array.isArray(childList)) return null;
  return childList.map((item, i) => {
    if (item && typeof item === "object" && "id" in item) {
      const node = item as { id: string; basePath?: string };
      return (
        <Fragment key={`${node.id}-${i}`}>
          {buildChild(node.id, node.basePath)}
        </Fragment>
      );
    }
    if (typeof item === "string") {
      return <Fragment key={`${item}-${i}`}>{buildChild(item)}</Fragment>;
    }
    return null;
  });
}

/**
 * Normalizes a resolved child-list value to `{ id, basePath }` entries,
 * preserving each row's scoped data path. Use when a renderer needs to wrap
 * children in its own element (e.g. `<li>`) rather than render them inline.
 */
export function childEntries(
  childList: unknown,
): { id: string; basePath?: string }[] {
  if (!Array.isArray(childList)) return [];
  return childList.flatMap((item) => {
    if (typeof item === "string") return [{ id: item }];
    if (item && typeof item === "object" && "id" in item) {
      const node = item as { id: string; basePath?: string };
      return [{ id: node.id, basePath: node.basePath }];
    }
    return [];
  });
}

/** Flattens a resolved child-list value to its string ids (templates expanded). */
export function childListIds(childList: unknown): string[] {
  if (!Array.isArray(childList)) return [];
  return childList
    .map((item) =>
      typeof item === "string"
        ? item
        : item && typeof item === "object" && "id" in item
          ? (item as { id: string }).id
          : null,
    )
    .filter((id): id is string => typeof id === "string");
}
