import type { JSX } from "solid-js";

export const justifyContentMap: Record<
  string,
  JSX.CSSProperties["justify-content"]
> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  spaceBetween: "space-between",
  spaceAround: "space-around",
  spaceEvenly: "space-evenly",
  stretch: "stretch",
};

export const alignItemsMap: Record<string, JSX.CSSProperties["align-items"]> = {
  start: "flex-start",
  end: "flex-end",
  center: "center",
  stretch: "stretch",
};

export const objectFitMap: Record<string, JSX.CSSProperties["object-fit"]> = {
  contain: "contain",
  cover: "cover",
  fill: "fill",
  none: "none",
  scaleDown: "scale-down",
};
