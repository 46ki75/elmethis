import { globalStyle } from "@vanilla-extract/css";
import { tokenVars } from "./token-vars";

/**
 * Emits the `@elmethis/core` design tokens as `--elmethis-*` custom properties
 * on `:root`. Theme switching is native: themed tokens are `light-dark()`
 * values resolved against the computed `color-scheme` (OS default; pin
 * `color-scheme: light | dark` on the root to force a theme).
 *
 * Built to a static `dist/tokens.css` via `scripts/build-tokens.ts`.
 */
globalStyle(":root", {
  colorScheme: "light dark",
  vars: tokenVars,
});
