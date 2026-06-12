# Testing Conventions

Authored against `packages/qwik` (the lead implementation). `react` and `vue`
follow the same two-layer shape with their framework's sibling adapters.

## The two layers

Tests split by **file suffix**, and each suffix maps to its own Vitest config so
the two never share global state.

| Suffix                     | Layer       | Environment                                             | Runs                |
| -------------------------- | ----------- | ------------------------------------------------------- | ------------------- |
| `*.spec.ts` / `*.spec.tsx` | **unit**    | node + test-util (`createDOM`) / SSR (`renderToString`) | `pnpm test.unit`    |
| `*.browser.spec.tsx`       | **browser** | real Chromium via Playwright                            | `pnpm test.browser` |

`pnpm test` runs `test.unit` then `test.browser`.

### `*.spec.tsx` — CSR (with test utils) + SSR

The fast, default layer. Covers anything that does **not** need a real browser:

- **Pure logic** — hooks/utilities with no DOM (signals, timing, parsing).
- **CSR via the framework test util** — Qwik `createDOM()` (`@qwik.dev/core/testing`);
  React Testing Library; Vue Test Utils. Drive interactions, assert rendered DOM.
- **SSR** — Qwik `renderToString()` (`@qwik.dev/core/server`); equivalent
  server renderers in react/vue. Assert the server HTML shell.

Each file picks its environment with a docblock when needed, e.g.
`// @vitest-environment happy-dom`.

### `*.browser.spec.tsx` — real browser (Playwright)

The slower layer, reserved for behavior the test-util DOM **cannot fake**. A test
belongs here when it needs any of:

- a **`useVisibleTask$` / effect with `document-ready`** to have actually fired
  (createDOM/happy-dom fire these unreliably under suite load);
- the **real Qwik optimizer** to resolve QRLs (catches QRL-in-iteration bugs that
  createDOM silently passes);
- **native element behavior** — `<dialog>.showModal()` and the top layer,
  focus management, real layout/measurement (`getBoundingClientRect`);
- **real Web APIs** — `localStorage`/`BroadcastChannel`, `StorageEvent`,
  `navigator.clipboard`, computed `color-scheme` / `matchMedia`;
- libraries that hook the live DOM (e.g. `@formkit/auto-animate`'s
  `MutationObserver`).

Use the framework's Vitest-Browser adapter: **`vitest-browser-qwik`** (`render()`
= CSR, `renderSSR()` = SSR), `vitest-browser-react`, `vitest-browser-vue`. All
share Vitest Browser Mode + the `@vitest/browser-playwright` provider.

**Default to the unit layer.** Only reach for `*.browser.spec.tsx` when the thing
under test is genuinely one of the above — the browser layer costs startup time
and a Playwright dependency, and adds no coverage for pure logic.

## Why two configs (not one with `test.projects`)

`vitest-browser-qwik`'s `testSSR()` patches global SSR state the instant it is
invoked, and a single config factory builds the whole `projects` array
regardless of which project runs — that corrupts the unit layer's
`createDOM`/`localStorage` globals. Keeping the browser config in a separate file
the unit run never loads is the only clean fix.

- `vite.config.ts` — unit layer. Excludes `**/*.browser.spec.tsx`.
- `vitest.browser.config.ts` — browser layer. `include: ["src/**/*.browser.spec.tsx"]`,
  Playwright provider, Chromium. Disable the Qwik Alt+click-to-source dev overlay
  (`qwikVite({ devTools: { clickToSource: false } })`) — it intercepts pointer
  events and breaks Playwright's actionability checks.

## Co-location

Specs sit **next to the source** (`use-modal.tsx` → `use-modal.spec.tsx` +
`use-modal.browser.spec.tsx`), not in a separate `__tests__` tree. The same unit
that lives in both layers shares a base name and differs only by the
`.browser` infix.

## Browser-layer gotchas (learned)

- An open `showModal()` dialog sits in the **top layer** and blocks pointer
  events to everything behind it — a modal's close control must be **inside** the
  dialog to be clickable in a test.
- Poll async/visible-task effects with `vi.waitFor`. When a test acts **after**
  mount (e.g. toggling theme), first wait on an observable mount-task settling
  point — otherwise a late-firing `document-ready` task can clobber the action.
- The shared `<html>` element and `localStorage` persist across tests in one
  browser tab — reset them in `beforeEach`/`afterEach`.

## CI

Each package's workflow runs the layers as separate jobs (see
`.github/workflows/qwik.yml`): `lint`, `format-check`, `build`,
`build-storybook`, `test-unit`, `test-browser`. The browser job installs the
Playwright browser first: `pnpm exec playwright install --with-deps chromium`.
