# Qwik v2 — Migration & Reference

Qwik v2 is currently in **beta** (as of 2026-05). Qwik v1 remains the stable
release. This page covers everything that changed from v1 → v2 so you can give
correct guidance regardless of which version the user is on.

## Detecting which version a project uses

Look at the project's `package.json` dependencies:

| Sees in `package.json`                      | Version |
| ------------------------------------------- | ------- |
| `@builder.io/qwik`, `@builder.io/qwik-city` | **v1**  |
| `@qwik.dev/core`, `@qwik.dev/router`        | **v2**  |

If both are present (interop scenario, see below), the app code itself is on v2
and `@builder.io/qwik` is being aliased for legacy dependencies.

## Package & identifier renames

The headline change in v2 is dropping the `@builder.io/` scope and splitting
`qwik-city` into a more generic `router` package.

| v1                                | v2                            |
| --------------------------------- | ----------------------------- |
| `@builder.io/qwik`                | `@qwik.dev/core`              |
| `@builder.io/qwik-city`           | `@qwik.dev/router`            |
| `@builder.io/qwik-react`          | `@qwik.dev/react`             |
| `@qwik-city-plan`                 | `@qwik-router-config`         |
| `@builder.io/qwik/jsx-runtime`    | `@qwik.dev/core/jsx-runtime`  |

Identifier renames in user code & Vite config:

| v1                  | v2                    |
| ------------------- | --------------------- |
| `QwikCityProvider`  | `QwikRouterProvider`  |
| `qwikCity`          | `qwikRouter`          |
| `QwikCityPlugin`    | `QwikRouterPlugin`    |
| `createQwikCity`    | `createQwikRouter`    |
| `qwikCityPlan`      | `qwikRouterConfig`    |
| `jsxs`              | `jsx`                 |

There is an automated codemod:

```bash
pnpm qwik migrate-v2
```

It handles package renames, identifier renames, Vite config, and dependency
updates for most projects.

## Behavioural changes you must know

### `useResource$` → `useAsync$` (and `<Resource>` → `<Suspense>`)

`useAsync$` is the v2 replacement for `useResource$`. The API is significantly
simpler.

```tsx
// v1
const data = useResource$<T>(async ({ track, cleanup }) => {
  track(() => id.value);
  const ctrl = new AbortController();
  cleanup(() => ctrl.abort());
  const r = await fetch(`/api/item/${id.value}`, { signal: ctrl.signal });
  return r.json();
});
return (
  <Resource
    value={data}
    onPending={() => <p>Loading…</p>}
    onResolved={(item) => <p>{item.name}</p>}
  />
);
```

```tsx
// v2
const data = useAsync$<T>(async ({ track, abortSignal }) => {
  track(id); // pass signal directly (track(() => id.value) still works)
  const r = await fetch(`/api/item/${id.value}`, { signal: abortSignal });
  return r.json();
});
return (
  <Suspense fallback={<p>Loading…</p>}>
    <p>{data.value.name}</p>
  </Suspense>
);
```

Key differences:

- `useAsync$` exposes `.value: T` directly (not `.value: Promise<T>`).
- It also exposes `.loading: boolean` and `.error: unknown` if you prefer
  manual branching over `<Suspense>`.
- `abortSignal` is provided by the context — no manual `AbortController` /
  `cleanup` plumbing.
- `track(sig)` (signal shorthand) is supported alongside the old
  `track(() => sig.value)` form.
- Built-in support for polling, concurrency control, and Server-Sent Events.

`<Suspense>` extras:

- `fallback` — JSX shown while pending
- `delay` — ms before showing fallback (prevents flashing for fast loads)
- `showStale` — keep previous content while re-loading

`<Suspense>` is **not** an error boundary. Use `useErrorBoundary()` for errors.

The `<Reveal>` component coordinates multiple Suspense boundaries with
`parallel | sequential | reverse | together` ordering and a `collapsed`
attribute to hide blocked boundaries entirely.

### `useComputed$` is sync-only

Passing an async function to `useComputed$` now throws **runtime error Q29**.
Move all async derivations to `useAsync$`.

```tsx
// v1 — worked (but was discouraged)
const x = useComputed$(async () => await fetch(...));

// v2 — throws Q29 at runtime
// → use useAsync$ instead
```

### `<QwikCityProvider>` → `useQwikRouter()`

The router moves from a provider wrapper to a hook call inside the root
component.

```tsx
// v1
export default component$(() => (
  <QwikCityProvider>
    <Head />
    <Body />
  </QwikCityProvider>
));

// v2
export default component$(() => {
  useQwikRouter(); // runs once during SSR for non-signal-reading components
  return (
    <>
      <Head />
      <Body />
    </>
  );
});
```

### `useVisibleTask$` — `eagerness` option removed

The `eagerness: 'load' | 'idle'` option is gone. Delete it from existing code.
v2 docs show a `strategy: 'document-ready'` option for cases that need eager
client execution; the hook is still positioned as a last resort.

### `@builder.io/qwik-labs` removed

Features migrated out of labs:

- **Insights** → `@qwik.dev/core/insights` (+ `@qwik.dev/core/insights/vite`)
- **Typed routes** → built into `@qwik.dev/router` via `qwikTypes()`

## New in v2

### `useSerializer$` / `createSerializer$` / `SerializerSymbol`

Custom serialization for types Qwik doesn't natively support, without resorting
to `noSerialize` (which would force re-creation on the client).

```ts
const serial = createSerializer$({
  serialize: (v: MyType) => v.toJSON(),
  deserialize: (raw) => MyType.fromJSON(raw),
});
```

Or attach a `SerializerSymbol` method directly to an object for ad-hoc
strategies.

### `useStore({ deep: false })`

Explicit shallow tracking on a store. Default behaviour is unchanged (deep).

### Infrastructure

- Built on **Vite Environment API** (better monorepo + adapter support).
- Out-of-the-box compatibility with **Vite 8** and **Rolldown**.
- **~30% smaller** serialized HTML.
- HMR preserves component state — "instant browser updates without losing
  state".

### Serialization tag format

Application code is unaffected, but custom tooling that parses Qwik's HTML may
need updates:

| v1                            | v2                                                                                  |
| ----------------------------- | ----------------------------------------------------------------------------------- |
| `<script type="qwik/json">…`  | `<script type="qwik/vnode">…` + `<script type="qwik/state">…` (at end of document)  |

## Interop: using v1 libraries from a v2 app

If a third-party library still depends on `@builder.io/qwik`, alias it through
the package manager so it resolves to v2 — otherwise you'll get two copies of
Qwik and a broken app.

```jsonc
// package.json
{
  "pnpm": {
    "overrides": {
      "@builder.io/qwik": "npm:@qwik.dev/core@^2"
    }
  }
}
```

For npm / yarn, use `overrides` / `resolutions` respectively with the same
mapping.

Also add `ssr.noExternal` entries in `vite.config.ts` so the optimizer can
process those libraries:

```ts
export default defineConfig({
  // ...
  ssr: { noExternal: ['some-qwik-lib'] },
});
```

## Quick v1→v2 cheat sheet

| Topic                  | v1                              | v2                                         |
| ---------------------- | ------------------------------- | ------------------------------------------ |
| Core package           | `@builder.io/qwik`              | `@qwik.dev/core`                           |
| Router package         | `@builder.io/qwik-city`         | `@qwik.dev/router`                         |
| React adapter          | `@builder.io/qwik-react`        | `@qwik.dev/react`                          |
| Async data hook        | `useResource$` + `<Resource>`   | `useAsync$` + `<Suspense>`                 |
| Computed (async)       | `useComputed$(async …)` (works) | Throws Q29 — use `useAsync$`               |
| Router setup           | `<QwikCityProvider>`            | `useQwikRouter()` hook                     |
| Visible-task eagerness | `eagerness: 'load' \| 'idle'`   | Removed (use `strategy: 'document-ready'`) |
| Labs package           | `@builder.io/qwik-labs`         | Removed (features moved into core/router)  |
| Migration              | n/a                             | `pnpm qwik migrate-v2`                     |

## Source

This reference summarises the official v2 docs from the v2 preview site:

- <https://qwikdev-build-v2.qwik-8nx.pages.dev/llms.txt>
- <https://qwikdev-build-v2.qwik-8nx.pages.dev/docs/upgrade.md>
