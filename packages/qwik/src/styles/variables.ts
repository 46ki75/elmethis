import type { CSSProperties } from "@qwik.dev/core";

/**
 * CSS custom properties exposed by `@elmethis/qwik` for theming and region-level overrides.
 *
 * ## Two-layer architecture
 *
 * - **Primitives** (`--elmethis-accent-*`) are theme-agnostic raw values. The same hex
 *   resolves in both light and dark mode.
 * - **Semantic roles** (`--elmethis-color-*`) are theme-aware. They reference primitives
 *   and flip under `[data-theme="dark"]`. Components consume these, not the primitives.
 *
 * ## How to override
 *
 * Set the variable on a wrapper element to retheme everything inside, via CSS inheritance:
 *
 * ```tsx
 * const themed: ElmethisCSSVariables = { "--elmethis-accent-error": "tomato" };
 *
 * <div style={themed}>
 *   <ElmTextField label="Email" required />
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

  // Primitive — Accent palette
  "--elmethis-accent-info"?: CSSProperties["color"];
  "--elmethis-accent-success"?: CSSProperties["color"];
  "--elmethis-accent-important"?: CSSProperties["color"];
  "--elmethis-accent-warning"?: CSSProperties["color"];
  "--elmethis-accent-error"?: CSSProperties["color"];
};
