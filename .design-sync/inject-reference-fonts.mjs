// design-sync only — inject the vendored webfonts into the reference storybook.
//
// The reference storybook (.design-sync/sb-reference) is REBUILT on every
// re-sync, and the repo's storybook loads no webfonts (core ships font-family
// token stacks, not @font-face — the host provides fonts). The design-sync
// previews DO vendor DM Sans / DM Mono / Source Code Pro / Zen Kaku Gothic New
// (.design-sync/fonts, wired via cfg.extraFonts), so without this step every
// compare pits DM Sans (preview) against a system-sans fallback (storybook)
// and the oracle can't verify typography. Run after EVERY sb-reference build:
//
//   node .design-sync/inject-reference-fonts.mjs
//
// Idempotent: skips if the marker is already present.
import { copyFileSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const here = dirname(fileURLToPath(import.meta.url));
const fontsDir = join(here, "fonts");
const sbRef = join(here, "sb-reference");
const iframe = join(sbRef, "iframe.html");
const MARKER = "<!-- ds-sync:vendored-fonts -->";

const html = readFileSync(iframe, "utf8");
if (html.includes(MARKER)) {
  console.log("[inject-reference-fonts] already injected — nothing to do");
  process.exit(0);
}

mkdirSync(join(sbRef, "ds-fonts"), { recursive: true });
for (const f of readdirSync(fontsDir)) {
  if (f.endsWith(".woff2")) copyFileSync(join(fontsDir, f), join(sbRef, "ds-fonts", f));
}
const css = readFileSync(join(fontsDir, "fonts.css"), "utf8").replaceAll('url("./', 'url("./ds-fonts/');
const block = `${MARKER}<style>\n${css}\n</style>`;
writeFileSync(iframe, html.replace("</head>", `${block}</head>`));
console.log("[inject-reference-fonts] injected vendored @font-face into sb-reference/iframe.html");
