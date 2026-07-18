# Testing Conventions

Authored against `packages/qwik` (the lead implementation). `react`, `solid`,
and `vue` follow the same two-layer shape with framework-specific renderers.

## The two layers

Tests split by **file suffix**, and each suffix maps to its own Vitest config so
the two never share global state.

| Suffix                     | Layer       | Environment                                    | Runs                |
| -------------------------- | ----------- | ---------------------------------------------- | ------------------- |
| `*.spec.ts` / `*.spec.tsx` | **unit**    | node + test-util (`createDOM`) / simulated DOM | `pnpm test.unit`    |
| `*.ssr.spec.tsx` (Solid)   | **unit**    | node + Solid server JSX transform              | `pnpm test.unit`    |
| `*.browser.spec.tsx`       | **browser** | real Chromium via Playwright                   | `pnpm test.browser` |

`pnpm test` runs `test.unit` then `test.browser`.

### `*.spec.tsx` — CSR (with test utils) + SSR

The fast, default layer. Covers anything that does **not** need a real browser:

- **Pure logic** — hooks/utilities with no DOM (signals, timing, parsing).
- **CSR via the framework test util** — Qwik `createDOM()` (`@qwik.dev/core/testing`);
  React Testing Library; Vue Test Utils. Drive interactions, assert rendered DOM.
- **SSR** — Qwik `renderToString()` (`@qwik.dev/core/server`); equivalent
  server renderers in react/vue. Solid uses co-located `*.ssr.spec.tsx` files
  because its server JSX requires a separate compiler pass. Assert the server
  HTML shell.

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
= CSR, `renderSSR()` = SSR), `vitest-browser-react`, `vitest-browser-vue`. Solid
uses `@solidjs/testing-library` with Vitest's `page.elementLocator()` bridge
because Vitest does not provide an official Solid renderer package. All share
Vitest Browser Mode + the `@vitest/browser-playwright` provider.

**Default to the unit layer.** Only reach for `*.browser.spec.tsx` when the thing
under test is genuinely one of the above — the browser layer costs startup time
and a Playwright dependency, and adds no coverage for pure logic.

## Why separate configs (not one with `test.projects`)

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

Solid has one additional physical config inside the unit layer:

- `vite.config.ts` compiles `*.spec.tsx` with Solid's DOM transform and runs
  them in `happy-dom` through `@solidjs/testing-library`;
- `vitest.ssr.config.ts` compiles `*.ssr.spec.tsx` with `solid({ ssr: true })`
  and runs them in node;
- `pnpm test.unit` runs both passes, so the public two-layer contract stays the
  same.

## Co-location

Specs sit **next to the source** (`use-modal.tsx` → `use-modal.spec.tsx` +
`use-modal.browser.spec.tsx`), not in a separate `__tests__` tree. The same unit
that lives in multiple targets shares a base name and differs only by the
`.browser` or Solid-specific `.ssr` infix.

## Browser-layer gotchas (learned)

- An open `showModal()` dialog sits in the **top layer** and blocks pointer
  events to everything behind it — a modal's close control must be **inside** the
  dialog to be clickable in a test.
- Poll async/visible-task effects with `vi.waitFor`. When a test acts **after**
  mount (e.g. toggling theme), first wait on an observable mount-task settling
  point — otherwise a late-firing `document-ready` task can clobber the action.
- The shared `<html>` element and `localStorage` persist across tests in one
  browser tab — reset them in `beforeEach`/`afterEach`.
- A `component$` rendered from a spec must **not close over a module-level
  const**. Qwik's lazy component segment re-imports the spec module to resolve
  the captured value, which re-runs `describe()` mid-test ("Calling the suite
  function inside test function is not allowed"). Inline the literal in the
  component; keep module consts for assertion code only.
- Real Web APIs gated by permissions (clipboard, geolocation, notifications)
  need a grant via the provider: `playwright({ contextOptions: { permissions:
[...] } })` in `vitest.browser.config.ts`.

## CI

Each package's workflow runs the layers as separate jobs (see
`.github/workflows/qwik.yml`): `lint`, `format-check`, `build`,
`build-storybook`, `test-unit`, `test-browser`. The browser job installs the
Playwright browser first: `pnpm exec playwright install --with-deps chromium`.
