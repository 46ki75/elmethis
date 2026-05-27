import type { CSSProperties } from "@qwik.dev/core";

/**
 * CSS custom properties exposed by `@elmethis/qwik` for theming and region-level overrides.
 *
 * ## Two-layer architecture
 *
 * - **Primitives** (`--elmethis-neutral-*`, `--elmethis-accent-*`) are theme-agnostic
 *   raw values. The same hex resolves in both light and dark mode.
 * - **Semantic roles** (`--elmethis-color-*`) are theme-aware. They reference primitives
 *   and flip under `[data-theme="dark"]`. Components consume these, not the primitives.
 *
 * ## How to override
 *
 * Set the variable on a wrapper element to retheme everything inside, via CSS inheritance:
 *
 * ```tsx
 * const themed: ElmethisCSSVariables = { "--elmethis-color-primary": "tomato" };
 *
 * <div style={themed}>
 *   <ElmHeading>I cascade tomato.</ElmHeading>
 * </div>
 * ```
 *
 * To rebrand globally, set the same property on `:root` in your app's stylesheet.
 *
 * ## When NOT to use these
 *
 * For per-instance styling (one paragraph should be red, one icon a specific color),
 * use the component's own props (`color`, `backgroundColor`, etc.). Those write to
 * component-private CSS variables that do not cascade into descendants — which is
 * what you want for content-specific overrides.
 *
 * **Rule of thumb:**
 * - Variable on a wrapper → retheme a region.
 * - Prop on a component → style one element.
 *
 * Never write `--elmethis-*` from a component prop on the component's own root —
 * the variable would leak into every descendant.
 */
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
  "--elmethis-accent-error"?: CSSProperties["color"];

  // Semantic — Color (theme-aware, references primitives)
  "--elmethis-color-primary"?: CSSProperties["color"];
  "--elmethis-color-secondary"?: CSSProperties["color"];

  "--elmethis-color-accent-muted"?: CSSProperties["color"];
};
