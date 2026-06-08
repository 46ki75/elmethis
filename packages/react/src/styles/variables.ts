/**
 * Public, overridable elmethis design tokens.
 *
 * These mirror the semantic layer defined in `global.css`. Consumers may
 * override any of them via a component's `style` prop. The primitive layer
 * (`--elmethis-primitive-*`) is intentionally not exposed here.
 */
export type ElmethisCSSVariables = {
  // Layout
  "--elmethis-margin-block-start"?: React.CSSProperties["marginBlockStart"];

  // Surfaces
  "--elmethis-color-surface-sunken"?: React.CSSProperties["backgroundColor"];
  "--elmethis-color-surface-base"?: React.CSSProperties["backgroundColor"];
  "--elmethis-color-surface-raised"?: React.CSSProperties["backgroundColor"];

  // Neutral (foreground) ramp
  "--elmethis-color-neutral-weak"?: React.CSSProperties["color"];
  "--elmethis-color-neutral"?: React.CSSProperties["color"];
  "--elmethis-color-neutral-strong"?: React.CSSProperties["color"];

  // Primary (accent) ramp
  "--elmethis-color-primary-weak"?: React.CSSProperties["color"];
  "--elmethis-color-primary"?: React.CSSProperties["color"];
  "--elmethis-color-primary-strong"?: React.CSSProperties["color"];
  "--elmethis-color-primary-hover"?: React.CSSProperties["color"];

  // Links
  "--elmethis-color-accent-link"?: React.CSSProperties["color"];
  "--elmethis-color-accent-link-visited"?: React.CSSProperties["color"];

  // Status accents
  "--elmethis-color-accent-info"?: React.CSSProperties["color"];
  "--elmethis-color-accent-info-surface"?: React.CSSProperties["backgroundColor"];
  "--elmethis-color-accent-success"?: React.CSSProperties["color"];
  "--elmethis-color-accent-success-surface"?: React.CSSProperties["backgroundColor"];
  "--elmethis-color-accent-important"?: React.CSSProperties["color"];
  "--elmethis-color-accent-important-surface"?: React.CSSProperties["backgroundColor"];
  "--elmethis-color-accent-warning"?: React.CSSProperties["color"];
  "--elmethis-color-accent-warning-surface"?: React.CSSProperties["backgroundColor"];
  "--elmethis-color-accent-error"?: React.CSSProperties["color"];
  "--elmethis-color-accent-error-surface"?: React.CSSProperties["backgroundColor"];

  // Effects
  "--elmethis-box-shadow-color"?: React.CSSProperties["color"];
};
