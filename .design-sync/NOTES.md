# design-sync notes — @elmethis/react

Target project: **Elmethis Theme** (`e062cd21-f7c9-4926-aaab-38fa5a93152d`).
Shape: **storybook** (`@storybook/react-vite`, 170 stories). Build from repo root.

## Build / re-sync setup

- `buildCmd`: `pnpm -F "@elmethis/react..." build` (trailing `...` builds the `@elmethis/core`
  workspace dep too — its `dist/tokens.css` is the token source).
- Built entry passed via `--entry packages/react/lib/index.react.mjs` (no `node_modules/@elmethis/react`
  in its own repo). `--node-modules packages/react/node_modules` (has react/react-dom/@elmethis).
- Reference storybook: `npx storybook build -c packages/react/.storybook -o <repo>/.design-sync/sb-reference`
  (run from `packages/react`). React 19 + vite 8.
- Converter deps in `.ds-sync/`: `esbuild ts-morph @types/react playwright@1.60.0`. playwright pinned to
  1.60.0 → chromium-1223, already in `~/.cache/ms-playwright` (no download).
- **Fresh clone also needs**: `npm i` inside `.design-sync/shiki-slim/` (gitignored node_modules — see below).

## [GENERAL] fixes baked into config / committed files

- **`titleMap` (config):** story titles are kebab `elm-*`; exports are PascalCase `Elm*`. Map each leaf
  title → export. Hooks (`Hooks/use*`) and the `use-wordle` demo are set to `null` (non-visual, excluded).
- **shiki bundle slim — the big one.** `@elmethis/react`'s `ElmShikiHighlighter` does
  `import { codeToHtml } from "shiki"`, pulling shiki's FULL grammar+theme set (~9.5 MB) → bundle 10.9 MB,
  over claude.ai/design's 5 MB cap. Fix: `cfg.tsconfig` (`../../.design-sync/shiki-tsconfig.json`) aliases the
  bare `shiki` specifier to `.design-sync/shiki-slim/index.mjs` — a curated ~35-language build using
  `@shikijs/core` + the inlined oniguruma WASM engine. Bundle → 4.6 MB. Shiki chain:
  ElmShikiHighlighter → ElmCodeBlock → {ElmMarkdown, ElmA2ui}. The highlighter already degrades any
  unsupported language to a plain `<pre>`, so uncovered langs are safe. `shiki-slim/` is a self-contained
  mini-package (its own `node_modules`, gitignored) so `@shikijs/*` resolve normally; versions pinned to
  shiki@4.2.0. **Re-sync risk:** a shiki major bump needs the pinned `4.2.0` deps + the curated lang list
  refreshed (build fails loud with `[UNRESOLVED_IMPORT]` if the store moves).
- **React Compiler runtime — silent-breakage [GENERAL].** The package is built with
  `babel-plugin-react-compiler`; compiled components import `c` from `react/compiler-runtime`. The converter's
  bundler shims all `react*` → `window.React`, which has NO `c` → every compiler-optimized component
  (icons, audio player, clipboard, …) throws `import_compiler_runtime.c is not a function` and renders empty,
  while non-optimized ones look fine (so it hides). Fix: `cfg.tsconfig` paths also alias
  `react/compiler-runtime` → `.design-sync/react-compiler-runtime.mjs` (a standard useRef memo-cache polyfill;
  paths plugin resolves before the react shim). **Worth reporting upstream**: the converter's reactShim
  should provide `c` for React-Compiler DSes.
- **`cfg.tsconfig` / `cfg.extraFonts` are resolved relative to PKG_DIR** (`packages/react`), not repo root —
  hence the `../../.design-sync/...` prefix. (storybookStatic resolves from cwd; the bases differ per field.)
- **Fonts — three roles, all vendored.** `@elmethis/core` (`token.ts`) defines two stacks:
  `--elmethis-font-family-sans` = `"DM Sans", "Zen Kaku Gothic New", …system…, sans-serif` and
  `--elmethis-font-family-monospace` = `"DM Mono", "Source Code Pro", …, "Zen Kaku Gothic New", monospace`
  (the JP face is the CJK fallback in both). Core ships no `@font-face` (host provides), so for claude.ai/design
  the OFL woff2 are vendored under `.design-sync/fonts/` — DM Sans latin 400/500/700, DM Mono 400/500,
  Source Code Pro 400, Zen Kaku Gothic New **japanese** 400/700 (full JP coverage in one file per weight via
  @fontsource, ~1 MB each, under the 5 MB per-file cap). Wired via `cfg.extraFonts`; **regenerate with
  `node .design-sync/fonts/fetch.mjs`** (it rewrites `fonts.css` too — don't hand-edit). Clears `[FONT_MISSING]`;
  English→DM Sans, code→DM Mono, Japanese→Zen Kaku. Headless Chromium has **no** JP font, so without the
  vendored Zen Kaku, JP previews (ElmInlineText ruby, ElmMarkdown ja.md) render as tofu.
- **Component CSS + light-dark — silent-breakage [GENERAL], the subtle one.** Two layered bugs:
  (1) The built `lib/index.react.mjs` doesn't import its CSS (vite extracts to `lib/style.css` separately),
  so the converter's default scrape only got `@elmethis/core/tokens.css` → `_ds_bundle.css` had tokens but
  ZERO component CSS → every design the agent builds would be unstyled (preview cards looked fine because
  they also link a per-component `_preview/<Name>.css`, which never reaches designs — only `styles.css`'s
  closure does). (2) `lib/style.css` is lightningcss-transpiled for es2020, so `light-dark()` became a
  `var(--lightningcss-light,X) var(--lightningcss-dark,Y)` polyfill, but lightningcss OMITTED the `:root`
  helper that defines those vars → ~14 direct-light-dark rules (shiki token colors, mdi/inline icon fills,
  checkbox, toggle-theme, text-area, …) resolved to an invalid two-value color → black. (Core token colors
  use native light-dark and were fine.) Fix for both: `cfg.cssEntry = ".ds-style-entry.css"`, a wrapper
  regenerated by `buildCmd` (`&& node .design-sync/make-css-entry.mjs`) = lightningcss helper block +
  `lib/style.css`. The converter appends cssEntry verbatim to `_ds_bundle.css`, which `styles.css` @imports,
  so component CSS + the helper now reach designs. cssEntry is PKG_DIR-bound, so the wrapper lives at
  `packages/react/.ds-style-entry.css` (gitignored, regenerated each build — never stale). **Worth reporting
  upstream**: the published `lib/style.css` lacks the lightningcss helper, so its light-dark rules are broken
  for any consumer too. The helper keys on `prefers-color-scheme` (lightningcss's design), so those ~14 rules
  follow OS scheme rather than a pinned `color-scheme`; harmless in the light-default design env, matches the
  storybook light reference.
- **Ambient body font — [GENERAL], now resolved in core.** `@elmethis/core`'s `tokens.css` sets
  `:root{font-family:var(--elmethis-font-family-sans)}` (alongside `color-scheme`); the stack ends in
  `sans-serif`, so it degrades to system sans when the host doesn't load the webfonts. `make-css-entry.mjs`
  restates `html{font-family:var(--elmethis-font-family-sans, sans-serif)}` on the cssEntry wrapper as
  belt-and-suspenders (in case `tokens.css` loads late). _Previously_ core had no body/sans token and the
  wrapper forced generic `sans-serif`; that earlier "no ambient body font" upstream gap is closed. Monospace
  components set their own font, unaffected.
- **Loaders:** `cfg.storyImports.loaders` maps `.mp3`/`.webp` → `dataurl` (audio player + parallax/block-image
  assets). tiny webp (~25 KB); tts.mp3 ~919 KB inlined into the ElmAudioPlayer preview.
- **`[GRID_OVERFLOW]` overrides (config):** ElmParallax/ElmTooltip/ElmPageTop → `cardMode: single`
  (fixed/portal escape); ElmMarkdown → `cardMode: column` (wide). Presentation-only; grades carry.

## Owned previews (`.design-sync/previews/`)

- **ElmAudioPlayer.tsx** — story's default `src` is a ~9 MB remote mp3 (soundhelix.com) → headless page-load
  timeout. Owned preview uses the local `tts` asset (via `@ds-stories/.../tts.mp3`, dataurl) for all cells;
  Errored uses a local bad path (instant fail, no network).
- **ElmCodeBlock.tsx**, **ElmShikiHighlighter.tsx** — stories `import code from "./seed/main.rs?raw"`;
  esbuild can't resolve Vite's `?raw` query, so these owned previews inline the rust seed as a string.
  (ElmMarkdown's `.md?raw` imports compile fine — no action needed there.)

## Accepted `close` grades (not fixable; not a defect)

- **ElmPageTop / Primary** — `position:fixed; bottom:0` scroll-to-top button, hidden at `scrollY<=100`. No
  prop exposes the scroll-visible state and a static capture can't scroll, so the button sits off the captured
  region. `cardMode:"single"` applied. Renders fine in a real scrolling app.
- **ElmMarkdown / Stream** — streaming demo (useEffect + setTimeout token feed). Non-deterministic single
  frame; sb and ds catch different moments. Props/wiring correct. ([GENERAL]: any streaming/animated story
  can't pixel-match — grade `close`.)
- **ElmBlockImage / Svg** — the nuxt.com `cdn-cgi` image host is unreachable in this sandbox; blank on both
  panels. Component structure matches. Also a remote-host dependency that could fail for end users.

## Re-sync risks (watch-list for the next sync)

- **Owned previews tied to upstream code/content:**
  - `ElmCodeBlock.tsx` / `ElmShikiHighlighter.tsx` inline a copy of `packages/react/src/components/code/seed/main.rs`.
    If that seed changes, the inlined rust drifts — re-copy it. (They exist only because esbuild can't resolve `?raw`.)
  - `ElmAudioPlayer.tsx` substitutes the local `tts.mp3` for the story's remote mp3 and hardcodes
    `title="SoundHelix-Song-1.mp3"` for the filename-fallback cells (the data-URL src breaks `fileNameFromSrc`).
    Total-time reads 0:38 vs the remote's 6:12 — expected. If the story's filenames/args change, update.
- **Partial verification:** `ElmA2ui` hit `[STORY_CAP]` — only 6 of 11 stories were captured/graded (all match).
  The tail 5 are similar A2UI catalog variants; raise `--max-stories 11` on a re-sync to verify them.
- **shiki version pin:** `.design-sync/shiki-slim/` deps are pinned to `4.2.0` to match the package's shiki.
  A shiki bump needs those bumped + the curated lang list reviewed (build fails loud if the store moves).
- **Vendored fonts:** `.design-sync/fonts/` holds DM Sans / DM Mono / Source Code Pro / Zen Kaku Gothic New
  woff2 (OFL, @fontsource), regenerated by `node .design-sync/fonts/fetch.mjs` — the single source of truth
  (edit the `FONTS` list there, never `fonts.css` by hand). The font-family **stacks** live in `@elmethis/core`
  `token.ts`; if a stack changes (new face, new weight), update `fetch.mjs` to match and re-run it. Weights
  vendored: DM Sans 400/500/700, Zen Kaku 400/700 (500/600 in component CSS map to the nearest).
- **Toolchain assumption:** the light-dark + ambient-font fixes exist because `lib/style.css` is
  lightningcss-transpiled for `es2020` (vite 8). If the react build switches to native `light-dark()` output
  (modern cssTarget) or ships a body font, the `make-css-entry.mjs` helper becomes redundant (harmless).
- **Network at grade time:** several stories load remote images (unsplash, ikuma.cloud, pnpm.io, rust-lang.org,
  npmmirror); they loaded here except nuxt.com. A fully-sandboxed re-sync would blank them on both panels —
  watch for `[ASSETS_BLOCKED]` and don't let it falsely pass image components.

## Known render warns (triaged — not new on re-sync)

- `[RENDER_THIN]` ElmMdiIcon / ElmCopyIcon / ElmLanguageIcon — genuinely small single-icon cards (svg+path
  present, they DO paint). ElmButton — renders 8 real buttons (label "elm-button"). ElmA2ui — renders async
  (h≈1700 once mounted); validate's early measure may read 0px. All verified via headless probe.
