# Qwik Core API Reference

`@builder.io/qwik` — runtime + component model

---

## Components

### `component$(fn: () => JSX.Element): Component`

The fundamental building block. Takes a function that returns JSX. The optimizer
extracts this into a lazy-loadable chunk.

```tsx
import { component$ } from "@builder.io/qwik";

export const MyButton = component$<{ label: string }>(({ label }) => {
  return <button>{label}</button>;
});
```

Props are passed as the first argument. All props must be serializable.

---

## State hooks

### `useSignal<T>(initialValue?: T): Signal<T>`

Creates a reactive value. Reading `.value` inside a component establishes a
subscription — the component re-renders when `.value` changes.

```tsx
const count = useSignal(0);
count.value++; // triggers re-render
```

Prefer over `useStore` for single scalar/object values.

### `useStore<T>(initialValue: T | (() => T), opts?: { deep?: boolean }): T`

Creates a deep-reactive proxy object. Mutations to any nested property trigger
re-renders of components that read that property.

```tsx
const state = useStore({ count: 0, user: { name: "Alice" } });
state.user.name = "Bob"; // reactive
```

With `{ deep: false }`, only top-level properties are tracked.

**Methods on stores** must be QRLs:

```tsx
type S = { count: number; inc: QRL<(this: S) => void> };
const s = useStore<S>({
  count: 0,
  inc: $(function (this: S) {
    this.count++;
  }),
});
```

### `useComputed$<T>(fn: () => T): Readonly<Signal<T>>`

Synchronous memoised derived value. Auto-tracks all signals/stores read inside
`fn`. Re-computes only when dependencies change.

```tsx
const upper = useComputed$(() => name.value.toUpperCase());
```

### `useResource$<T>(fn: ResourceFn<T>): ResourceReturn<T>`

Async computed value. Does **not** block rendering.

```tsx
const result = useResource$<User>(async ({ track, cleanup }) => {
  track(() => userId.value);
  const ctrl = new AbortController();
  cleanup(() => ctrl.abort());
  return fetch(`/api/users/${userId.value}`, { signal: ctrl.signal }).then(
    (r) => r.json(),
  );
});
```

`track(fn)` declares reactive dependencies. `cleanup(fn)` runs before every
re-execution or when the component is destroyed.

Render with `<Resource>`:

```tsx
<Resource
  value={result}
  onPending={() => <span>Loading…</span>}
  onRejected={(err) => <span>Error: {err.message}</span>}
  onResolved={(user) => <span>{user.name}</span>}
/>
```

---

## Task hooks

### `useTask$(fn: TaskFn, opts?: { eagerness? })`

Runs before first render (server or browser). If it tracks state, re-runs on
changes. Blocks rendering until its promise resolves.

```tsx
useTask$(async ({ track, cleanup }) => {
  const id = track(() => props.id);
  const ctrl = new AbortController();
  cleanup(() => ctrl.abort());
  const data = await fetchData(id, ctrl.signal);
  store.data = data;
});
```

`track(fn)` — subscribes to reactive deps. `cleanup(fn)` — runs before
re-execution or destroy. Without `track`, runs exactly once.

### `useVisibleTask$(fn: VisibleTaskFn, opts?: { strategy? })`

Browser-only, runs after the element becomes visible (or immediately with
`strategy: 'document-ready'`). For DOM manipulation, third-party libs,
event listeners, timers.

```tsx
useVisibleTask$(({ cleanup }) => {
  const listener = () => console.log("scrolled");
  window.addEventListener("scroll", listener);
  cleanup(() => window.removeEventListener("scroll", listener));
});
```

Strategies:

- `'intersection-observer'` (default) — runs when element enters viewport
- `'document-ready'` — runs when document is ready (like DOMContentLoaded)
- `'document-idle'` — runs when document is idle

---

## Context

```tsx
// 1. Create a typed ID (outside components, usually in a shared module)
export const UserCtx = createContextId<User>("app.user");

// 2. Provide
useContextProvider(UserCtx, useStore<User>({ name: "", role: "viewer" }));

// 3. Consume in any descendant
const user = useContext(UserCtx);

// Optional — consume with fallback if provider may not exist
const user = useContextProvider(UserCtx, defaultValue);
```

---

## Slots (component composition)

```tsx
// Parent declares slots
export const Card = component$(() => (
  <div class="card">
    <header>
      <Slot name="title" />
    </header>
    <main>
      <Slot />
    </main>{" "}
    {/* default slot */}
  </div>
));

// Consumer fills slots
<Card>
  <span q:slot="title">My Title</span>
  <p>Main content goes here.</p> {/* goes into default Slot */}
</Card>;
```

---

## Events

Event handlers use the `EventName$` pattern:

```tsx
<button onClick$={() => count.value++}>Click</button>
<input onInput$={(e, el) => (name.value = el.value)} />
```

The handler is a QRL — it is lazy-loaded when the event fires, not on page
load.

**Prevent default / stop propagation:**

```tsx
<a
  href="/"
  onClick$={(e) => {
    e.preventDefault();
    doSomething();
  }}
>
  link
</a>
```

**`window:on*` and `document:on*`** — attach global listeners declaratively:

```tsx
<div window:onScroll$={() => onScroll()} />
```

---

## Serialisation

### `noSerialize<T>(value: T): NoSerialize<T>`

Marks a value as intentionally non-serializable. It will be `undefined` on
resume. Re-initialise it in `useVisibleTask$`.

```tsx
const store = useStore<{ editor: NoSerialize<Monaco> }>({ editor: undefined });

useVisibleTask$(() => {
  store.editor = noSerialize(monaco.editor.create(el.value!, {}));
});
```

### Serializable types

✅ Primitives, plain objects, arrays, `Date`, `URL`, `Map`, `Set`, DOM
element references (as `Signal<Element | undefined>`), QRLs, promises
(inside `useResource$`).

❌ Class instances with custom prototype, streams, functions not wrapped in
`$()`.

### `$` boundary serialization rules

Only serializable data can cross a `$` boundary. The boundary is created
whenever you write `$(...)` or any `xxxx$(...)` call.

```tsx
// Top-level exported symbols are always allowed (even non-serializable)
export const topLevel = Promise.resolve("data"); // OK to reference

// Captured local variables must be const + serializable
component$(() => {
  const captureOk = "hello"; // ✅
  const capturePromise = Promise.resolve("qwik"); // ✅
  const captureBad = new MyClass(); // ❌ runtime error

  return (
    <button
      onClick$={() => {
        console.log(captureOk); // ✅
        console.log(capturePromise); // ✅
        console.log(captureBad); // ❌ runtime serialization error
      }}
    >
      click
    </button>
  );
});
```

## Styling

```tsx
// Inline styles (use camelCase)
<div style={{ backgroundColor: "red", fontSize: "2em" }} />;

// CSS modules (co-located .css files)
import styles from "./button.css?inline";
useStylesScoped$(styles);

// Global styles
import styles from "./global.css?inline";
useStyles$(styles);
```

---

## QRL internals (advanced)

A QRL is a lazy reference: `./chunk.js#symbolName`. The optimizer creates them
automatically at `$` boundaries. You rarely need to create them manually, but
you can with `$(fn)`:

```tsx
const handler = $((event: MouseEvent) => {
  /* ... */
});
<button onClick$={handler} />;
```

Type of a QRL: `QRL<(arg: T) => R>`.

### QRL encoding with captured scope

When a `$`-closure captures local variables, the QRL encodes them:

```text
./chunk-c.js#Counter_onClick[0,1]
```

The `[0,1]` array are indexes into `q:obj` on the element. At runtime,
`useLexicalScope()` restores the captured variables:

```ts
const Counter_onClick = () => {
  const [count, props] = useLexicalScope();
  count.value += props.step || 1;
};
```

### `$` boundary rules

Variables captured in a `$`-closure must be:

1. Declared as `const` (not `let` or `var`).
2. Serializable at runtime (primitives, signals, stores, QRLs, plain objects/arrays).

Top-level module symbols must be exported (or imported) to be safely captured.

```tsx
// ✅ Valid — const + serializable
const foo = { data: 12 };
component$(() => <div onClick$={() => console.log(foo)} />);

// ❌ Invalid — let
let bar = "value";
component$(() => <div onClick$={() => console.log(bar)} />);

// ❌ Invalid — custom class instance (not serializable)
const inst = new MyClass();
component$(() => <div onClick$={() => console.log(inst)} />);
```

---

## `bind:*` directives

Two-way binding shorthand:

```tsx
<input bind:value={nameSignal} />
// equivalent to:
<input value={nameSignal.value} onInput$={(_, el) => (nameSignal.value = el.value)} />
```

---

## Rendering details

- **Fine-grained**: only the component that reads a changed signal/store
  re-renders. No virtual DOM diffing.
- **Async rendering**: rendering is async and streaming-friendly.
- **Keys**: use `key` prop on list items to help Qwik track identity.

```tsx
{
  items.map((item) => <Item key={item.id} item={item} />);
}
```

---

## `isServer` / `isBrowser` guards

Available from `@builder.io/qwik/build`:

```tsx
import { isServer, isBrowser } from "@builder.io/qwik/build";

useTask$(() => {
  if (isServer) {
    /* server-only logic */
  }
  if (isBrowser) {
    /* browser-only logic */
  }
});
```

Use sparingly. Prefer `useVisibleTask$` for browser-only work instead.

---

## Testing helper

```tsx
import { createDOM } from "@builder.io/qwik/testing";

const { screen, render, userEvent } = await createDOM();
await render(<MyComponent />);
const btn = screen.querySelector("button")!;
await userEvent(btn, "click");
```

---

## `useOn`, `useOnDocument`, `useOnWindow`

Register event listeners declaratively without requiring the browser to load
JavaScript eagerly:

```tsx
// Listen on the component's root element
useOn(
  "click",
  $(() => console.log("clicked")),
);

// Listen on document
useOnDocument(
  "scroll",
  $(() => onScroll()),
);

// Listen on window
useOnWindow(
  "resize",
  $(() => handleResize()),
);
```

Prefer these over `useVisibleTask$` + `addEventListener` — they don't force
JavaScript loading until the event fires.

---

## `sync$` — synchronous inline handlers

For cases where you need a synchronous event handler (e.g., to call
`event.preventDefault()` synchronously):

```tsx
<a href="/" onClick$={sync$((e: MouseEvent) => e.preventDefault())}>
  link
</a>
```

`sync$` handlers are inlined into the HTML and do not lazy-load. Keep them
tiny. They cannot close over reactive state.

---

## Best practices

### Inline template operations

```tsx
// ❌ Sub-optimal: captures signal read outside template — whole component re-renders
const isBig = count.value > 0 ? "big" : "small";
return (
  <div>
    {isBig} - {count.value}
  </div>
);

// ✅ Optimal: expressions inline so only the affected nodes re-render
return (
  <div>
    {count.value > 0 ? "big" : "small"} - {count.value}
  </div>
);
```

### Use `useComputed$` for derived values

```tsx
// ❌ Direct read in component body forces full re-render
const double = count.value * 2;

// ✅ useComputed$ re-runs only when count.value changes
const double = useComputed$(() => count.value * 2);
return <div>{double.value}</div>;
```

### Use `useVisibleTask$` as a last resort

`useVisibleTask$` blocks the main thread and loads JavaScript eagerly.
Prefer:

- `useTask$` — for logic that can run on the server
- `useOn` / `useOnDocument` / `useOnWindow` — for event listeners

### Use `useLocation()` instead of `window.location`

```tsx
// ❌ Forces browser-only execution, eager JS load
if (window.location.href.includes('foo')) { ... }

// ✅ Works in SSR, no JS overhead
const loc = useLocation();
if (loc.url.href.includes('foo')) { ... }
```

---

## Qwikloader (internals)

Qwikloader is a ~1 KB inline script that:

1. Registers global event listeners for all browser events.
2. On an event, walks up the DOM looking for `on:<event>` attributes.
3. Parses the QRL attribute (`./chunk.js#symbolName[scope]`), fetches the
   chunk, retrieves the symbol, and calls it.
4. Uses `q:base` to resolve relative chunk URLs.

This is how Qwik achieves zero JS on startup — no listeners are added by
application code; Qwikloader handles them all from serialized HTML attributes.

---

## Containers (advanced)

Every Qwik app lives in a container element (usually `<html>`). Containers:

- Resume independently from each other.
- Can be nested (micro-frontends, routing outlets).
- Can run different Qwik versions.
- Can be updated with `innerHTML` without full page reload.

Custom attributes on the container via `renderToStream` / `renderToString`:

```tsx
renderToStream(<Root />, {
  containerAttributes: { lang: "en", dir: "ltr" },
});
// Outputs: <html lang="en" dir="ltr" q:container="paused" ...>
```

In Qwik City, use `containerAttributes` in `src/entry.ssr.tsx`:

```tsx
export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    manifest,
    ...opts,
    containerAttributes: { lang: "en-us", ...opts.containerAttributes },
  });
}
```
