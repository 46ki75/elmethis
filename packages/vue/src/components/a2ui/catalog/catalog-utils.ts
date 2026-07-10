import { type CSSProperties } from "vue";

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
