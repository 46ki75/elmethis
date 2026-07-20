# Solid Core

Read this reference for Solid components, props, JSX, state, reactivity,
control flow, context, lifecycle, and async primitives outside router data.

## Version Gate

This file describes stable Solid v1 unless stated otherwise. Before applying an
example, inspect installed packages and imports. Solid v2 is beta and changes
web imports, effect signatures, store updates, async/error boundaries, and list
primitives. Use the official `/v2/` page and installed declarations for v2; do
not translate a v1 example by changing only its import.

## Mental Model

The component function establishes DOM and reactive computations. It does not
rerun for each state change. A tracked scope subscribes to the reactive values
read synchronously during its execution.

```tsx
import { createMemo, createSignal } from "solid-js";

export function Counter(props: { step: number }) {
  const [count, setCount] = createSignal(0);
  const doubled = createMemo(() => count() * 2);

  return (
    <button onClick={() => setCount(value => value + props.step)}>
      {count()} / {doubled()}
    </button>
  );
}
```

`count`, `doubled`, and similar accessors must be called. Reading `props.step`
inside the event handler preserves the current prop value.

## Props

- Treat props as a reactive object.
- Prefer `props.value` at the point of use.
- Use `splitProps` to separate local props from pass-through props while
  retaining reactivity.
- Use `mergeProps` for reactive defaults.
- Use the `children` helper when children are accessed repeatedly or require
  stable resolution.
- Destructure only when the value is intentionally captured or the helper in
  use preserves its reactive property descriptor.

## Derived State and Effects

- Compute pure derived state inline or with `createMemo` when caching and
  downstream dependency tracking are useful.
- Use `createEffect` to synchronize with storage, logging, subscriptions, or
  imperative APIs after reactive values change.
- Use `on` when dependencies or deferred execution need to be explicit.
- Use `untrack` only when a read deliberately must not become a dependency.
- Avoid effect chains that copy one signal into another; they add scheduling
  edges and can expose intermediate inconsistent state.

Use specialized v1 primitives only when their semantics fit:

- `batch` makes several independent writes visible atomically; work after an
  `await` is outside the batch, and many Solid setters/effects already batch.
- `createSelector` reduces fan-out for keyed equality checks in large lists.
- `createReaction` arms a one-invalidation callback and must be re-armed.
  Prefer an effect for ongoing synchronization.

Version-check specialized primitives before using them in v2.

## Stores

`createStore` provides nested proxy state. Read properties directly and update
through `setStore` paths, predicates, ranges, or reconciliation helpers.
Destructuring a primitive store property loses its live proxy read.

Use `produce` for convenient nested mutation and `reconcile` when replacing
data while preserving identity is valuable. Do not mutate store state outside
the setter APIs.

## Ownership and Lifecycle

- Set up DOM-dependent libraries in `onMount`.
- Register `onCleanup` beside timers, listeners, observers, sockets, and
  subscriptions. Remove the exact function that was registered.
- Keep computations under a component, root, or other reactive owner.
- Use context for dependency injection or state shared by a subtree. Create a
  provider rather than exporting request-specific singleton state.
- Async continuations, timers, events, and third-party callbacks may run without
  the component's owner. Capture `getOwner()` synchronously and use
  `runWithOwner()` only when later synchronous work must create owned
  computations or read context. It restores ownership, not dependency
  tracking, and does not extend through `await`.
- In v1, prefer owned `from()` for external producers or subscribables and
  `observable()` when exposing an accessor to Observable consumers. If no owner
  exists, arrange explicit disposal.

## Control Flow

- `<Show>` handles a reactive condition and fallback.
- `<For>` is keyed by item identity and exposes a reactive index accessor.
- `<Index>` is keyed by position and exposes each item as an accessor.
- `<Switch>` and `<Match>` express mutually exclusive branches.
- `<Suspense>` coordinates resources and async primitives with fallbacks.
- `<ErrorBoundary>` renders recoverable errors from its owned subtree.

Non-keyed `<Show>` preserves its child block while the condition remains
truthy; its callback receives an accessor. Use `keyed` when a truthy value
identity change must recreate ownership; its callback receives the value.

V1 `<ErrorBoundary>` catches errors from rendering and reactive updates, not
event handlers or unrelated scheduled callbacks. A function fallback receives
the error and `reset`. Use lower-level `catchError` only when establishing a
reactive error scope without JSX. Solid v2 uses its documented error boundary
and fallback shape instead.

Choose control flow for ownership and identity, not merely stylistic parity
with JavaScript conditionals.

## Dynamic Rendering and Code Splitting

- In v1, import `Dynamic` from `solid-js/web` and use
  `<Dynamic component={source()} />` when runtime state selects a native tag or
  component. Remaining props are forwarded; an absent component renders
  nothing. In v2, web primitives come from `@solidjs/web`, and `dynamic(source)`
  is useful when reusable stable component identity is needed.
- Use `lazy(() => import(...))` for a default-exported code-split component. Put
  v1 lazy content under `<Suspense>` and call `.preload()` for intent-based
  loading. Use v2's documented loading boundary instead of copying v1 syntax.
- Use `<Portal>` for overlays that must escape clipping. In v1 it defaults to
  `document.body`, normally creates a wrapper, propagates delegated events
  through the component tree, and emits no server output. Guard browser-only
  mount expressions and provide an SSR-appropriate shell.

## Async Core

Use `createResource` for non-router asynchronous data when it matches the
project architecture. Pass a reactive source when the request has a key. Treat
the resource as an accessor and account for loading, errors, refetching, and
stale responses. Router applications may instead use `query` and
`createAsync`; read `router.md` before mixing models.

## JSX and DOM

- `onClick`-style handlers use Solid's delegated event system for supported
  events; `on:click` installs a native listener. Choose by semantics, not style.
  Use native handlers for custom or nondelegated events and where native
  propagation behavior is required.
- Event bindings are not reactive. If a callback prop or signal can change, use
  a stable wrapper such as `onClick={() => props.onClick?.()}`. Use `onInput`
  for immediate value updates and native `onChange` commit/blur semantics.
- In TypeScript, prefer `event.currentTarget` for the attached element because
  `target` may be a descendant.
- Use `class` and `classList` according to existing style conventions.
- Refs are variables or callbacks, not React ref objects by default.
- Spread only intended DOM props and avoid forwarding component-only fields.
- Prefer semantic HTML and accessible names before adding test identifiers.

Avoid combining a reactive `class` with `classList`: replacing `class` can erase
toggled classes. `classList` also does not work through spreads or `<Dynamic>`,
so construct a `class` string for polymorphic pass-through components.

Use `use:name={value}` directives for reusable behavior on native/custom
elements. A directive runs before connection under the current owner and
receives its value as an accessor. Register cleanup beside listeners and
observers, augment Solid's JSX directive types, and ensure imports used only by
`use:*` are not erased by the build.

## SSR and Hydration

- Server and initial client structure must match. Do not derive initial markup
  from time, randomness, browser state, locale, or mutable global state unless
  the value is serialized consistently.
- V1 `createEffect` does not run during SSR or initial hydration. Never rely on
  it to produce server HTML.
- Use `createUniqueId()` for label and ARIA relationships that must match across
  SSR and hydration, and call it in the same order on server and client.
- In custom SSR, include Solid's hydration bootstrap once and choose
  synchronous string, async string, or streaming rendering according to async
  requirements. `hydrate()` expects Solid server output and returns a disposer.
- V1 portals produce no server output. Browser-only APIs belong behind
  `onMount`, a client-only boundary, or an `isServer` guard as appropriate.

## TypeScript Traps

- Verify the project's JSX compiler settings and version-appropriate
  `jsxImportSource`; stable v1 commonly uses `jsx: "preserve"` and `solid-js`.
- A signal created without an initial value includes `undefined`.
- To store a function value, pass a setter function that returns it; otherwise
  the function is interpreted as an updater.
- Type generic components as generic functions rather than forcing them through
  `Component<T>`. Keep refs nullable until lifecycle guarantees availability.
