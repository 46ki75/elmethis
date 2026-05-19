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

  // Semantic — Color (theme-aware, references primitives)
  "--elmethis-color-primary"?: CSSProperties["color"];
  "--elmethis-color-text"?: CSSProperties["color"];
  "--elmethis-color-text-background"?: CSSProperties["backgroundColor"];
  "--elmethis-color-accent-muted"?: CSSProperties["color"];
  "--elmethis-color-selection-text"?: CSSProperties["color"];
  "--elmethis-color-selection-background"?: CSSProperties["backgroundColor"];
};
