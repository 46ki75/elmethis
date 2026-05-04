---
name: qwik
description: >
  Expert guidance for building applications with Qwik and Qwik City — covering
  resumability, components, signals, stores, tasks, context, QRLs, file-based
  routing, route loaders, route actions, middleware, endpoints, layouts, and
  deployment. Use this skill whenever someone is writing, debugging, or
  reviewing Qwik or Qwik City code, asking how things like useSignal, useStore,
  useTask$, routeLoader$, routeAction$, component$, or the $ suffix work, wants
  to understand resumability vs hydration, is setting up a new Qwik project, is
  adding server-side data fetching, building a REST or JSON endpoint, configuring
  middleware, deploying to Cloudflare/Vercel/Node/etc., or wondering why their
  Qwik app behaves differently from React. Always invoke this skill for any
  question that mentions Qwik, Qwik City, QRL, routeLoader$, routeAction$,
  useVisibleTask$, noSerialize, or the resumable architecture, even if the
  question seems simple.
license: MIT
metadata:
  author: "Ikuma Yamashita"
  version: "1.0"
---

# Qwik & Qwik City Skill

You are an expert in the Qwik framework and its meta-framework Qwik City. Your
goal is to help users write correct, idiomatic, and performant Qwik code.

## Quick orientation

| Package                 | Import                                                                                                                                                                          | Purpose                  |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------ |
| `@builder.io/qwik`      | `component$`, `useSignal`, `useStore`, `useTask$`, `useVisibleTask$`, `useResource$`, `useComputed$`, `useContext`, `useContextProvider`, `createContextId`, `$`, `noSerialize` | Core framework           |
| `@builder.io/qwik-city` | `routeLoader$`, `routeAction$`, `Form`, `Link`, `useLocation`, `useNavigate`, `RequestHandler`                                                                                  | Meta-framework / routing |

## Core concepts you must always apply

### 1 – Resumability, not hydration

Qwik **serializes** the entire application state (listeners, component tree,
store values) into the HTML at SSR time. On the client, it **resumes** exactly
where the server left off — no code needs to be re-downloaded or re-executed to
make the page interactive.

Practical implications for code you write:

- State that crosses the server-to-client boundary **must be serializable**.
  Primitives, plain objects/arrays, `Date`, `URL`, `Map`, `Set`, DOM refs, and
  QRL-wrapped functions all work. Class instances (custom `instanceof`) and
  streams do not.
- Use `noSerialize()` to wrap non-serializable values (e.g., third-party editor
  instances). They will be `undefined` on resume and must be re-initialised
  inside `useVisibleTask$`.
- Don't think of components as "running on mount" — the lifecycle is
  **server -> pause -> resume on client**, not "mount everything in the browser".

### 2 – The `$` suffix and QRLs

Any function ending in `$` (e.g., `component$`, `useTask$`, `onClick$`, `$()`)
creates a **QRL boundary**. The Qwik optimiser extracts the closure into a
separate lazy-loadable chunk. Rules:

- Variables captured inside a `$`-closure must themselves be serializable
  (signals, stores, primitives, other QRLs) — they are serialized along with
  the listener.
- Don't import non-serializable values into a `$`-closure and expect them to
  survive resumption.
- The optimiser runs at build time; you don't call it manually.

### 3 – State management at a glance

```tsx
// Fine-grained reactive value
const count = useSignal(0);
count.value++; // triggers only components that read count.value

// Deep reactive object — tracks nested mutations by default
const state = useStore({ user: { name: "Alice" }, items: [] });
state.user.name = "Bob"; // triggers re-render of consumers

// Derived/computed — synchronous, memoised
const upper = useComputed$(() => name.value.toUpperCase());

// Async computed — fetch or other async work
const data = useResource$<T>(async ({ track, cleanup }) => {
  track(() => id.value); // re-run when id changes
  const ctrl = new AbortController();
  cleanup(() => ctrl.abort());
  return fetch(`/api/item/${id.value}`, { signal: ctrl.signal }).then((r) =>
    r.json(),
  );
});
// Render with <Resource value={data} onPending=... onResolved=... />
```

Prefer `useSignal` for single values, `useStore` for related multi-field
objects. Use `useComputed$` over `useTask$` for pure derived values — it is
simpler and auto-tracks.

### 4 – Tasks and the lifecycle

```text
useTask$ -> RENDER -> useVisibleTask$
           |                |
     SERVER or BROWSER   BROWSER only
```

| Hook              | When it runs                                                                | Use it for                                                    |
| ----------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `useTask$`        | Before first render (server or browser); re-runs when tracked state changes | Async init, side effects that should run on server AND client |
| `useVisibleTask$` | After render, browser only, when element becomes visible                    | DOM manipulation, third-party libs, subscriptions             |
| `useResource$`    | Before render, async, non-blocking                                          | Async data that should not block rendering                    |

`useTask$` blocks rendering until its promise resolves. Use it for critical
data. `useResource$` does not block — the component renders immediately with the
pending state.

Important: `useTask$` that tracks no state runs **exactly once**, either on the
server or the browser, not both. Use `isServer`/`isBrowser` guards only when
you genuinely need to branch.

### 5 – Context

```tsx
// 1. Declare a typed context ID (module scope — not inside a component)
export const ThemeCtx = createContextId<Signal<string>>("app.theme");

// 2. Provide it in an ancestor
useContextProvider(ThemeCtx, useSignal("dark"));

// 3. Consume in any descendant
const theme = useContext(ThemeCtx);
```

Context is the idiomatic way to share state across a subtree without prop
drilling. The provided value can be a signal, store, or any serializable value.

---

## Qwik City — routing and server integration

Read `references/qwik-city.md` for detailed API docs including: routing,
`routeLoader$`, `routeAction$`, middleware, endpoints, `server$`, caching,
error handling, re-exporting loaders, `validator$`, complex forms, advanced
routing (404 pages, grouped/named layouts, plugin files), request handling /
cookie API, redirects, SSG, speculative module fetching, and HTML attributes.

See `references/doc-index.md` for a complete index of all documentation pages
and their coverage status.

Key points:

### File-based routing

```text
src/routes/
├── layout.tsx          ← wraps all child routes
├── index.tsx           ← page: /
├── about/
│   └── index.tsx       ← page: /about
├── blog/
│   ├── layout.tsx      ← wraps /blog/**
│   └── [slug]/
│       └── index.tsx   ← page: /blog/:slug  (params.slug)
└── api/
    └── items/
        └── index.ts    ← JSON endpoint: GET/POST /api/items
```

Catch-all: `[...all]/index.tsx` matches any depth.

### Data loading — `routeLoader$`

The right way to load server data that is needed before the page renders:

```tsx
// src/routes/product/[id]/index.tsx
export const useProduct = routeLoader$(async ({ params, fail }) => {
  const product = await db.products.find(params.id);
  if (!product) return fail(404, { message: "Not found" });
  return product;
});

export default component$(() => {
  const product = useProduct(); // Signal<Product>
  return <h1>{product.value.name}</h1>;
});
```

- Must be exported from `layout.tsx` or `index.tsx` (or re-exported from those
  files if defined elsewhere).
- Runs **on the server on every navigation** before the component renders.
- Access request context via `params`, `cookie`, `headers`, `url`, `method`,
  `env`, `sharedMap`.
- Call `requestEvent.resolveValue(useOtherLoader)` to depend on another loader.

### Form actions — `routeAction$`

Handle mutations (POST forms, API calls):

```tsx
import { routeAction$, zod$, z } from "@builder.io/qwik-city";

export const useCreateItem = routeAction$(
  async (data, { redirect }) => {
    await db.items.create(data);
    throw redirect(302, "/items");
  },
  zod$({ name: z.string().min(1), qty: z.number() }),
);

export default component$(() => {
  const action = useCreateItem();
  return (
    <Form action={action}>
      <input name="name" />
      <input name="qty" type="number" />
      <button type="submit">Create</button>
    </Form>
  );
});
```

### Middleware

Export `onRequest` / `onGet` / `onPost` (etc.) from any `layout.tsx` or
`index.tsx`. They run in order from outermost layout to innermost `index.ts`.

```tsx
export const onRequest: RequestHandler = async ({ next, cookie, redirect }) => {
  const token = cookie.get("session")?.value;
  if (!token) throw redirect(302, "/login");
  await next();
};
```

### JSON / REST endpoints

Export only `onGet`/`onPost`/… (no default component export) from an
`index.ts` file:

```ts
// src/routes/api/users/index.ts
export const onGet: RequestHandler = async ({ json }) => {
  const users = await db.users.findAll();
  json(200, users);
};
```

---

## React-to-Qwik migration quick reference

If the user is coming from React, this table is often the most useful thing to show first:

| React pattern                                  | Qwik equivalent                                                     | Notes                               |
| ---------------------------------------------- | ------------------------------------------------------------------- | ----------------------------------- |
| `useEffect(() => {}, [])`                      | `useVisibleTask$(() => {})`                                         | Browser-only, after render          |
| `useEffect(() => {}, [dep])`                   | `useVisibleTask$(({ track }) => { track(() => sig.value); ... })`   | Re-runs when tracked signal changes |
| `useEffect(() => { return () => cleanup(); })` | `useVisibleTask$(({ cleanup }) => { cleanup(() => ...); })`         |                                     |
| `useRef<T>(null)`                              | `useSignal<T>()` + `ref={myRef}`                                    |                                     |
| `useState(v)`                                  | `useSignal(v)` — read/write via `.value`                            |                                     |
| `useState({ a, b, c })`                        | `useStore({ a, b, c })` — deep reactive proxy                       |                                     |
| `useMemo(() => expr, deps)`                    | `useComputed$(() => expr)` — auto-tracks                            |                                     |
| Storing a class instance in state              | `noSerialize(instance)` stored in `useStore<{ x: NoSerialize<T> }>` |                                     |
| Context (`createContext` + `Provider`)         | `createContextId` + `useContextProvider` + `useContext`             |                                     |

### Non-serializable values — the critical pattern React developers miss

This is the most common stumbling block when migrating. Class instances (chart
libraries, editors, WebSocket connections, etc.) cannot be serialized by Qwik.
**Always** use `noSerialize`:

```tsx
import { component$, useStore, useSignal, useVisibleTask$, noSerialize, type NoSerialize } from '@builder.io/qwik';
import type { Chart } from 'chart.js';

export const ChartComponent = component$(() => {
  const canvasRef = useSignal<HTMLCanvasElement>();
  // NoSerialize<T>: will be undefined on the server and on resume
  const store = useStore<{ chart: NoSerialize<Chart> }>({ chart: undefined });

  useVisibleTask$(({ cleanup }) => {
    // This replaces React's useEffect(() => {...}, [])
    import('chart.js/auto').then(({ Chart }) => {
      store.chart = noSerialize(new Chart(canvasRef.value!, { type: 'bar', data: {...} }));
    });
    cleanup(() => store.chart?.destroy());
  });

  return <canvas ref={canvasRef} />;
});
```

**Why**: Qwik serializes all component state to HTML for resumability. Without
`noSerialize`, Qwik will try (and fail) to serialize the class instance. With
`noSerialize`, Qwik sets the value to `undefined` during SSR and resume — you
re-create it in `useVisibleTask$`.

---

## Common patterns and pitfalls

### Passing signals vs values as props

```tsx
// ✅ Pass value when child only reads
<Child isOpen={modal.value} />

// ✅ Pass signal when child needs to write (or when prop is used as a bind:)
<Child modal={modal} />

// ⛔ Don't pass the whole signal when only its value is needed
<Child isOpen={modal} />   // child receives Signal object, not boolean
```

### `bind:value` two-way binding

```tsx
const name = useSignal("");
<input bind:value={name} />; // equivalent to value={name.value} + onInput$
```

### `useVisibleTask$` for DOM/browser-only work

```tsx
useVisibleTask$(({ cleanup }) => {
  const timer = setInterval(() => tick(), 1000);
  cleanup(() => clearInterval(timer));
});
```

### `noSerialize` for non-serializable third-party instances

```tsx
const store = useStore<{ editor: NoSerialize<Monaco> }>({ editor: undefined });

useVisibleTask$(() => {
  store.editor = noSerialize(monaco.editor.create(ref.value!, {}));
});
```

---

## Reference files

### Core references (read for most Qwik questions)

- **`references/qwik-core.md`** — complete API reference for `@builder.io/qwik`
  (all hooks, component lifecycle, QRL details, slots, rendering). Read when
  you need exact signatures or advanced topics (containers, optimizer details).
- **`references/qwik-city.md`** — complete API reference for `@builder.io/qwik-city`
  (routing, loaders, actions, middleware, layouts, endpoints, deployment). Read
  when working on anything server-side or routing-related.
- **`references/qwik-deprecated.md`** — migration table for all deprecated APIs
  (`useWatch$`, `useClientEffect$`, `loader$`, `action$`, etc.). Read when the
  user mentions old APIs or is migrating from an older version.

### Cookbook recipes (read for specific "how do I" patterns)

When the user asks _how to implement_ a specific common pattern, read the
matching file from `references/cookbook/`:

| Pattern                      | File                                     |
| ---------------------------- | ---------------------------------------- |
| Algolia / search             | `cookbook/algolia-search.md`             |
| Composing middleware         | `cookbook/combine-request-handlers.md`   |
| Debounce input               | `cookbook/debouncer.md`                  |
| Image load detection         | `cookbook/detect-img-onload.md`          |
| Drag and drop                | `cookbook/drag-and-drop.md`              |
| Fonts / FOIT / CLS           | `cookbook/fonts.md`                      |
| `import.meta.glob`           | `cookbook/glob-import.md`                |
| iOS media / audio playback   | `cookbook/media-controller.md`           |
| Active nav link              | `cookbook/nav-link.md`                   |
| Docker deployment            | `cookbook/node-docker-deploy.md`         |
| Modals / tooltips / portals  | `cookbook/portals.md`                    |
| Streaming / deferred loaders | `cookbook/streaming-deferred-loaders.md` |
| `sync$` / `preventDefault`   | `cookbook/sync-events.md`                |
| Dark/light theme toggle      | `cookbook/theme-management.md`           |
| View Transitions API         | `cookbook/view-transition.md`            |

### Integrations (read when user asks about a specific tool or library)

When the user is setting up or asking about a specific third-party tool, read
the matching file from `references/integrations/`:

| Tool / Library         | File                                     |
| ---------------------- | ---------------------------------------- |
| React (`qwikify$`)     | `integrations/react.md`                  |
| Auth.js / NextAuth     | `integrations/authjs.md`                 |
| Tailwind CSS v4        | `integrations/tailwind.md`               |
| Tailwind CSS v3        | `integrations/tailwind-v3.md`            |
| Vitest (unit tests)    | `integrations/vitest.md`                 |
| Playwright (E2E)       | `integrations/playwright.md`             |
| Cypress                | `integrations/cypress.md`                |
| i18n / translations    | `integrations/i18n.md`                   |
| Drizzle ORM            | `integrations/drizzle.md`                |
| Prisma ORM             | `integrations/prisma.md`                 |
| Supabase               | `integrations/supabase.md`               |
| Turso / libSQL         | `integrations/turso.md`                  |
| Modular Forms          | `integrations/modular-forms.md`          |
| Image optimization     | `integrations/image-optimization.md`     |
| Icons                  | `integrations/icons.md`                  |
| Partytown              | `integrations/partytown.md`              |
| Panda CSS              | `integrations/panda-css.md`              |
| PostCSS                | `integrations/postcss.md`                |
| styled-vanilla-extract | `integrations/styled-vanilla-extract.md` |
| Bootstrap              | `integrations/bootstrap.md`              |
| Storybook              | `integrations/storybook.md`              |
| Nx monorepo            | `integrations/nx.md`                     |
| OG image generation    | `integrations/og-img.md`                 |
| Orama search           | `integrations/orama.md`                  |
| Leaflet maps           | `integrations/leaflet-map.md`            |
| Builder.io CMS         | `integrations/builderio.md`              |
| Astro                  | `integrations/astro.md`                  |
| Tauri desktop app      | `integrations/tauri.md`                  |

### Labs / experimental (read for cutting-edge or experimental APIs)

When the user asks about experimental Qwik features, read the matching file
from `references/labs/`:

| Feature                             | File                           |
| ----------------------------------- | ------------------------------ |
| Qwik Insights (real-user analytics) | `labs/insights.md`             |
| Qwik Devtools / `qwik/json` parsing | `labs/devtools.md`             |
| Typed routes                        | `labs/typed-routes.md`         |
| `usePreventNavigate$`               | `labs/use-prevent-navigate.md` |

### Full documentation index

**`references/doc-index.md`** — complete index of all 132 pages under
`packages/docs/src/routes/docs/` with coverage status for each. Read when you
need to verify what's covered or to navigate to a specific topic area.
