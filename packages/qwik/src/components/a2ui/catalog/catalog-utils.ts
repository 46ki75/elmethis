import { type CSSProperties } from "@qwik.dev/core";

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
 * When applied to the first child in a flow, suppresses the top margin so
 * vertical rhythm doesn't add unwanted space above the leading block.
 * Reusable across every block-level renderer.
 *
 * Sets `margin-block-start` directly instead of the `--elmethis-margin-block-start`
 * custom property: the variable inherits, so on container renderers (Column,
 * ColumnList, Callout, Toggle, Tabs, …) the override would cascade into every
 * nested block and zero out all top margins.
 */
export function firstChildMargin(index: number): CSSProperties | undefined {
  return index === 0 ? { marginBlockStart: 0 } : undefined;
}
