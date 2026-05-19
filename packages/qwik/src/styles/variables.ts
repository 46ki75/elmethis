import type { CSSProperties } from "@qwik.dev/core";

export type ElmethisCSSVariables = {
  "--elmethis-margin-block-start"?: CSSProperties["marginBlockStart"];

  "--elmethis-color-primary"?: CSSProperties["color"];
  "--elmethis-color-text"?: CSSProperties["color"];
  "--elmethis-color-text-background"?: CSSProperties["backgroundColor"];
  "--elmethis-color-accent-muted"?: CSSProperties["color"];

  "--elmethis-scoped-collapse-transition-duration"?: CSSProperties["transitionDuration"];
  "--elmethis-scoped-transition-timing-function"?: CSSProperties["transitionTimingFunction"];
};
