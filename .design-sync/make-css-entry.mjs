// design-sync only: regenerate the cssEntry wrapper.
//
// @elmethis/react's vite build targets es2020, so lightningcss transpiles every
// `light-dark()` in lib/style.css into a `var(--lightningcss-light,X)
// var(--lightningcss-dark,Y)` polyfill — but it omits the `:root` helper block
// that defines those vars, so ~14 direct-light-dark rules (shiki token colors,
// icon fills, checkbox, …) resolve to an invalid two-value color → black.
// (Token colors via @elmethis/core/tokens.css use native light-dark and are
// fine.) This prepends the helper block lightningcss should have emitted, then
// the real component CSS, and writes the result as the cfg.cssEntry the
// converter appends to _ds_bundle.css. Run from repo root by cfg.buildCmd after
// the package build, so it's always regenerated from the fresh lib/style.css
// (never stale). Output is gitignored; this script + config are committed.
import { readFileSync, writeFileSync } from "node:fs";

const LIB_CSS = "packages/react/lib/style.css";
const OUT = "packages/react/.ds-style-entry.css";

// prefers-color-scheme polyfill — exactly what lightningcss emits for light-dark()
// when it transpiles. Custom-prop defs at :root apply regardless of source order.
const helper = `/* design-sync: lightningcss light-dark() runtime helper (see make-css-entry.mjs) */
:root{--lightningcss-light:initial;--lightningcss-dark: ;}
@media (prefers-color-scheme:dark){:root{--lightningcss-light: ;--lightningcss-dark:initial;}}
/* design-sync: ambient body font. @elmethis/core ships only a monospace token,
   no body/sans token — the DS relies on the host's default. Storybook's sb.css
   sets html{font-family:sans-serif}; mirror it so text renders sans (not the
   browser-default serif) in both preview cards and agent-built designs.
   Monospace components set their own font explicitly, so they're unaffected. */
html{font-family:sans-serif;}
`;

const libCss = readFileSync(LIB_CSS, "utf8");
writeFileSync(OUT, helper + "\n" + libCss);
console.error(`[make-css-entry] wrote ${OUT} (${(helper.length + libCss.length)} bytes)`);
