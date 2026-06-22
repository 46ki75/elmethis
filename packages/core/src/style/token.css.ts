import { globalStyle } from "@vanilla-extract/css";
import { tokenVars } from "./token-vars";

/**
 * Emits the `@elmethis/core` design tokens as `--elmethis-*` custom properties
 * on `:root`. Theme switching is native: themed tokens are `light-dark()`
 * values resolved against the computed `color-scheme` (OS default; pin
 * `color-scheme: light | dark` on the root to force a theme).
 *
 * The root also adopts the sans body font so importing `tokens.css` is enough
 * to get the design system's typography. The stack ends in `sans-serif`, so it
 * degrades to the platform sans when the host doesn't load the webfonts (core
 * ships only the token names, never `@font-face`).
 *
 * Built to a static `dist/tokens.css` via `scripts/build-tokens.ts`.
 */
globalStyle(":root", {
  colorScheme: "light dark",
  fontFamily: "var(--elmethis-font-family-sans)",
  vars: tokenVars,
});
