import type { CSSProperties } from "@qwik.dev/core";

export type ElmethisCSSVariables = {
  // Layout
  "--elmethis-margin-block-start"?: CSSProperties["marginBlockStart"];

  // Primitive — Neutral scale
  "--elmethis-neutral-100"?: CSSProperties["color"];
  "--elmethis-neutral-200"?: CSSProperties["color"];
  "--elmethis-neutral-300"?: CSSProperties["color"];
  "--elmethis-neutral-400"?: CSSProperties["color"];
  "--elmethis-neutral-600"?: CSSProperties["color"];
  "--elmethis-neutral-700"?: CSSProperties["color"];
  "--elmethis-neutral-800"?: CSSProperties["color"];

  // Primitive — Accent palette
  "--elmethis-accent-primary"?: CSSProperties["color"];
  "--elmethis-accent-info"?: CSSProperties["color"];
  "--elmethis-accent-success"?: CSSProperties["color"];
  "--elmethis-accent-warning"?: CSSProperties["color"];

  // Primitive — Spacing scale
  "--elmethis-space-1"?: CSSProperties["margin"];
  "--elmethis-space-2"?: CSSProperties["margin"];
  "--elmethis-space-3"?: CSSProperties["margin"];
  "--elmethis-space-4"?: CSSProperties["margin"];
  "--elmethis-space-6"?: CSSProperties["margin"];
  "--elmethis-space-8"?: CSSProperties["margin"];

  // Primitive — Radius scale
  "--elmethis-radius-sm"?: CSSProperties["borderRadius"];
  "--elmethis-radius-md"?: CSSProperties["borderRadius"];

  // Primitive — Duration scale
  "--elmethis-duration-fast"?: CSSProperties["transitionDuration"];
  "--elmethis-duration-medium"?: CSSProperties["transitionDuration"];
  "--elmethis-duration-slow"?: CSSProperties["transitionDuration"];

  // Primitive — Easing
  "--elmethis-ease-default"?: CSSProperties["transitionTimingFunction"];
  "--elmethis-ease-out"?: CSSProperties["transitionTimingFunction"];

  // Semantic — Color (theme-aware, references primitives)
  "--elmethis-color-primary"?: CSSProperties["color"];
  "--elmethis-color-text"?: CSSProperties["color"];
  "--elmethis-color-text-background"?: CSSProperties["backgroundColor"];
  "--elmethis-color-accent-muted"?: CSSProperties["color"];
  "--elmethis-color-selection-text"?: CSSProperties["color"];
  "--elmethis-color-selection-background"?: CSSProperties["backgroundColor"];

  // Scoped (component-private)
  "--elmethis-scoped-collapse-transition-duration"?: CSSProperties["transitionDuration"];
  "--elmethis-scoped-transition-timing-function"?: CSSProperties["transitionTimingFunction"];
};
