# @elmethis/react — recreation plan (port from @elmethis/qwik)

`packages/react` is being recreated from scratch to reach convention parity
with the **qwik lead implementation**. Branch: `react/recreate`.

## Conventions (the `elm-paragraph` port is the reference template)

- **Files:** `kebab-case` (`elm-inline-text.tsx`), co-located per component.
- **Imports:** relative (no `@components/` aliases).
- **Tokens:** consume `@elmethis/core/tokens.css`; semantic `--elmethis-*` only,
  never hardcoded hex. Component-private vars use the `--elmethis-scoped-*`
  prefix and are registered in `src/styles/_component-vars.css`.
- **Theming:** native `light-dark()` + `color-scheme`.
- **CSS:** CSS Modules, `.elm-*` root class named after the component, child
  roles nested, variant/state as standalone classes (see root `CLAUDE.md`).
- **Class merge:** `clsx` (replaces qwik's `class={[...]}` array).
- **Props:** native passthrough via `ComponentPropsWithoutRef<"…">`; `is`/`has`
  boolean prefixes; scoped CSS vars cast through `CSSProperties`.
- **Tests:** `*.spec.tsx` unit (`[CSR]` via RTL + `[SSR]` via
  `renderToStaticMarkup`); `*.browser.spec.tsx` only where the qwik twin has one.

## Per-agent contract (one agent per module)

Input: the qwik twin path + this doc. Deliver the **5 files** (where applicable):

1. `<name>.tsx` 2. `<name>.module.css` 3. `<name>.spec.tsx`
4. `<name>.stories.tsx` 5. `<name>.browser.spec.tsx` — **only** if the qwik twin
   has one (see list below).

Return structured data: `{ exportLine, newScopedVars[], newDeps[], notes }`.
Agents do **not** touch `src/index.ts` or `_component-vars.css` — the
orchestrator merges those between waves, then runs `pnpm check`.

## Scope

**Core library now.** Deferred to a dedicated follow-up: `components/a2ui/**`
and `components/ag-ui-client/**` (protocol-heavy; need `@ag-ui/*` + `@a2ui/*`
runtime deps). 86 modules, 5 waves.

## Hook layer (React-idiom mapping — needs a short design pass before Wave 0)

Qwik's signal/store split does not exist in React; some hooks consolidate.

| qwik hook | React mapping |
| --- | --- |
| `use-bindable-signal` / `-store` | `@radix-ui/react-use-controllable-state` |
| `use-debounced-signal` / `-store` | `usehooks-ts` `useDebounceValue` |
| `use-throttled-signal` / `-store` / `-queue` | `es-toolkit` `throttle` wrapper |
| `use-storage` | `usehooks-ts` `useLocalStorage` (or hand-written) |
| `use-clipboard` | `usehooks-ts` `useCopyToClipboard` (+ icon) |
| `use-auto-animate` | `@formkit/auto-animate/react` |
| `use-async-state`, `use-delayed-signal` | hand-written |
| `use-elmethis-theme` | hand-written, native `color-scheme` |

**Deps to add before Wave 0:** `@radix-ui/react-use-controllable-state`,
`@formkit/auto-animate`, `es-toolkit`, `usehooks-ts`. (`clsx` already added.)

## Waves (build wave N fully + verify before N+1)

`[B]` = also needs `*.browser.spec.tsx`.

### Wave 0 — 35 leaves ✅ COMPLETE (all green: lint, lint.css, 151 unit + 12 browser tests, build)

> Note: `components/table/index.ts` currently re-exports only `elm-table-row` +
> `table-context`; uncomment the `elm-table` / `-header` / `-body` / `-cell`
> re-exports as those land in Wave 1/2. (The dep analysis missed `export … from`
> re-exports, so `table/index` was ported a wave early — harmless, just scope it.)

- code: `elm-katex`, `elm-shiki-highlighter`
- containments: `elm-collapse`, `elm-modal` [B], `elm-parallax`, `elm-tooltip` [B]
- fallback: `elm-rectangle-wave`
- form: `elm-switch`
- icon: `elm-dot-loading-icon`, `elm-inline-icon`, `elm-mdi-icon`, `elm-square-loading-icon`, `languages/language-interface`
- navigation: `elm-page-top`
- others: `wordle/validGuesses`, `wordle/wordlist`
- table: `elm-table-row`, `index`, `table-context`
- typography: `elm-divider`, `elm-fragment-identifier`, `elm-list`, `elm-paragraph` ✅ DONE
- hooks: `use-async-state`, `use-auto-animate` [B], `use-bindable-signal`, `use-bindable-store`, `use-debounced-signal`, `use-debounced-store`, `use-delayed-signal`, `use-elmethis-theme` [B], `use-storage` [B], `use-throttled-queue`, `use-throttled-signal`, `use-throttled-store`

### Wave 1 — 35
- containments: `elm-tabs`
- fallback: `elm-block-fallback`
- form: `elm-button`
- icon: `elm-toggle-theme`, `languages/*` (18 trivial data files → one agent)
- navigation: `elm-breadcrumb`
- others: `elm-color-primitive-sample`, `elm-color-semantic-sample`, `use-wordle` [B]
- table: `elm-table-body`, `elm-table-cell`, `elm-table-header`
- typography: `elm-block-quote`, `elm-callout`, `elm-heading`, `elm-inline-text`
- hooks: `use-clipboard` [B], `use-modal` [B]

### Wave 2 — 13
- containments: `elm-toggle` [B]
- fallback: `elm-unsupported-block`
- form: `elm-checkbox`, `elm-select` [B], `elm-text-area`, `elm-text-field`, `elm-validation`
- icon: `elm-copy-icon`, `elm-language-icon`
- media: `elm-block-image` [B], `elm-file`
- navigation: `elm-bookmark`
- table: `elm-table`

### Wave 3 — 1
- code: `elm-code-block`

### Wave 4 — 2
- others: `elm-jarkup`, `elm-markdown`

## Modules needing `*.browser.spec.tsx` (11)

`elm-modal`, `elm-toggle`, `elm-tooltip`, `elm-select`, `elm-block-image`,
`use-wordle`, `use-auto-animate`, `use-clipboard`, `use-elmethis-theme`,
`use-modal`, `use-storage`.

## Orchestration

One Workflow per wave: fan out parallel agents (one per module, except the 18
`languages/*` share one). No worktree isolation (distinct files per agent).
Barrier at wave end → orchestrator updates `index.ts` + `_component-vars.css`
from returned data → `pnpm check` → next wave.
