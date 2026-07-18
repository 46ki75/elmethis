# Solid Core

Read this reference for Solid components, props, JSX, state, reactivity,
control flow, context, lifecycle, and async primitives outside router data.

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

## Control Flow

- `<Show>` handles a reactive condition and fallback.
- `<For>` is keyed by item identity and exposes a reactive index accessor.
- `<Index>` is keyed by position and exposes each item as an accessor.
- `<Switch>` and `<Match>` express mutually exclusive branches.
- `<Suspense>` coordinates resources and async primitives with fallbacks.
- `<ErrorBoundary>` renders recoverable errors from its owned subtree.

Choose control flow for ownership and identity, not merely stylistic parity
with JavaScript conditionals.

## Async Core

Use `createResource` for non-router asynchronous data when it matches the
project architecture. Pass a reactive source when the request has a key. Treat
the resource as an accessor and account for loading, errors, refetching, and
stale responses. Router applications may instead use `query` and
`createAsync`; read `router.md` before mixing models.

## JSX and DOM

- Solid event handlers are attached to real DOM behavior; inspect whether the
  codebase prefers delegated `onClick` or native `on:click` forms.
- Use `class` and `classList` according to existing style conventions.
- Refs are variables or callbacks, not React ref objects by default.
- Spread only intended DOM props and avoid forwarding component-only fields.
- Prefer semantic HTML and accessible names before adding test identifiers.
