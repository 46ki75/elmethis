# Porting `@elmethis/qwik` → `@elmethis/vue`

Working reference for bringing `@elmethis/vue` to parity with the qwik lead
implementation. Read alongside the root `CLAUDE.md` (naming/token/test
conventions) and `TESTING.md`. `packages/qwik` is the source of truth for
component behavior; `packages/react` is the reference for "official-first"
library choices.

## Scope

- **In scope:** 66 components across `code`, `containments`, `fallback`,
  `form`, `icon`, `media`, `navigation`, `others`, `table`, `typography`, plus
  the hooks they depend on.
- **Dropped:** `ag-ui-client` (as react did — CopilotKit covers it).
- **Deferred:** `a2ui` — `@a2ui/vue` does not exist; it needs a hand-authored
  Vue layer on `@a2ui/web_core`, tackled later as its own track.
- No external dependency needs adding for the in-scope waves — `package.json`
  already carries katex, shiki, marked, dompurify, `@formkit/auto-animate`,
  `@vueuse/core`, clsx, es-toolkit, zod, `@mdi/js`.

## Authoring style

Components are authored in **TSX** via `defineComponent({ name, props, setup })`
returning a render function — **not** `.vue` SFCs. Consequences:

- `class` not `className`; children via `slots.default?.()`.
- Props are **runtime-declared** in `props: {...}` so they stay out of `attrs`.
- `inheritAttrs: false` + explicit `class`/`style` merge of leftover `attrs`
  onto the root (see `elm-inline-text.tsx`, `elm-checkbox.tsx`).

## Conventions (hard-won — do not rediscover)

1. **Controllable state = `v-model` + `useBindableSignal`.** `defineModel` is a
   `<script setup>` compiler macro and is unavailable in this TSX style. Declare
   a model prop with `default: undefined` (so "unbound" ≠ a real `false`) +
   `emits: ["update:<key>"]` (**array form** — the typed object form produces an
   `emit` signature that isn't assignable to the hook due to parameter
   contravariance). Hook returns a writable `Ref<T>` read/written via `.value`,
   mirroring qwik's `Signal<T>`. Template: `elm-checkbox.tsx`.
2. **csstype types belong only on the exported `*Props` interface, never on
   runtime prop types.** `{ type: String }` infers `string`; using
   `PropType<CSSProperties["color"]>` makes `vue-tsc`'s inferred component type
   unnameable on emit (**TS2883**). Keep the rich `CSSProperties[...]` types on
   the interface for consumer DX; keep runtime props plain. See
   `elm-inline-text.tsx`.
3. **Composables may return components** (`CopyButton`, `Modal`). Valid in Vue:
   create the `defineComponent` **once** inside the composable body (a composable
   runs once in `setup`) and let it read reactive state by closure. No react-style
   stable-identity ref hack is needed.
4. **CSS Modules, kebab-case `.elm-*`**, co-located `*.module.css`. Every
   component owns its own module — there are no shared global style files beyond
   `src/styles/_component-vars.css` and `src/styles/text.module.css`.
5. **Native theming** via CSS `light-dark()` + `color-scheme`; non-color
   overrides read `data-theme`. shiki needs an explicit fallback (it can't use
   `light-dark()`).

## Per-component Definition of Done

Each component ships five things, matching the react/qwik shape:

- `x.tsx` — the component.
- `x.module.css` — co-located styles (copy verbatim from react when present).
- `x.spec.tsx` — unit: `[CSR]` via `@vue/test-utils` `mount` + `[SSR]` via
  `vue/server-renderer` `renderToString`.
- `x.stories.tsx` — Storybook (`@storybook/vue3-vite`).
- An export added to `src/index.ts`.

Green through **`pnpm check`** (now includes `build:types`).

## Testing layers

- Default to **unit** (`*.spec.tsx`, happy-dom + Vue Test Utils + SSR).
- Add a **browser** spec (`*.browser.spec.tsx`, real Chromium) only for behavior
  happy-dom can't service. Mirror react's split: unit covers closed/state-only,
  browser covers the real-DOM lifecycle. Browser-required in this port:
  `use-elmethis-theme`, `use-clipboard`, `use-modal`, `elm-modal`,
  `elm-collapse`, `elm-parallax`, `elm-page-top`, `elm-toggle-theme`,
  `elm-block-image`. Reasons: `dialog.showModal()`, computed `color-scheme`,
  IntersectionObserver, real clipboard.

## Archetype templates

Every remaining component is a variation on one of these — copy the template.

| Archetype | Template | Status |
| --- | --- | --- |
| Presentational (icon / typography) | `elm-inline-text`, `elm-inline-icon` | done |
| Stateful / `v-model` | `elm-checkbox` | done |
| Native `<dialog>` / browser-only | `elm-modal` | Phase 0 |
| Async library wrapper | `elm-shiki-highlighter` | Phase 0 |
| Theme / global-DOM mutation | `use-elmethis-theme` | Phase 0 |
| Composable returning a component | `use-clipboard`, `use-modal` | Phase 0 |

## Hook strategy — official-first

| Hook | Vue approach |
| --- | --- |
| `use-bindable-signal` | `@vueuse` `useVModel` (passive) → writable `Ref<T>`. **Done.** |
| `use-clipboard` | `@vueuse` `useClipboard({ copiedDuring })` (auto-resets `copied` — no manual timer); rich `ClipboardItem[]` → `useClipboardItems`. Returns `{ copy, CopyButton }`. Imports `elm-mdi-icon`. |
| `use-modal` | `ref(isOpen)` + `Modal` `defineComponent` wrapping `ElmModal`. Imports `elm-modal`. |
| `use-elmethis-theme` | `ref` + `watch` mutating `<html>` `color-scheme`/`data-theme`; persistence via `@vueuse` `useStorage`. ⚠️ verify `useStorage` syncs **same-tab** across instances — react needed a `CustomEvent` broadcast; replicate if absent. |

The other ~11 public hooks (debounce/throttle/store/async-state/storage/delayed/
auto-animate) are standalone and not blocking — a separate later track.

## Execution order (sequential, dependency-ordered)

`src/index.ts` is the only shared mutable file — author components without
touching it, regenerate the barrel at each wave close.

- **Phase 0 — Foundation:** `use-elmethis-theme` → `elm-mdi-icon` → `elm-modal`
  → `elm-shiki-highlighter` → `use-clipboard` + `use-modal`.
- **Phase 1 — Wave 0 fan-out (~36 leaves):** 1a trivial SVG icons (19 language
  + 2 loaders); 1b typography/table; 1c interaction (browser-tested); 1d misc
  (`elm-switch`, `elm-katex`, `use-wordle` + its `wordle/` data dir,
  `elm-toggle-theme`).
- **Phase 2 — Wave 1 (19):** buttons/forms/headings/callouts/media etc.
- **Phase 3 — `elm-code-block`.**
- **Phase 4 — `elm-markdown`.**

Commit per sub-batch, each green through the full gate.
