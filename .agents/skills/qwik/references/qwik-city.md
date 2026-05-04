# Qwik City API Reference

`@builder.io/qwik-city` — meta-framework: routing, data loading, middleware,
deployment adapters

---

## Project structure

```text
src/
└── routes/
    ├── layout.tsx          # Root layout (wraps all pages)
    ├── index.tsx           # Page: /
    ├── about/
    │   └── index.tsx       # Page: /about
    ├── blog/
    │   ├── layout.tsx      # Nested layout for /blog/**
    │   └── [slug]/
    │       └── index.tsx   # Page: /blog/:slug
    ├── (group)/            # Route group (no URL segment)
    │   └── dashboard/
    │       └── index.tsx   # Page: /dashboard
    ├── [...catchAll]/
    │   └── index.tsx       # Catch-all: /anything/else
    └── api/
        └── users/
            └── index.ts    # Endpoint (no component): GET/POST /api/users
```

---

## Routing

### `useLocation(): RouteLocation`

Returns current URL, params, and navigation state.

```tsx
import { useLocation } from '@builder.io/qwik-city';

const loc = useLocation();
loc.url          // URL object
loc.params       // { slug: 'my-post', ... }
loc.isNavigating // true during SPA navigation
```

### `useNavigate(): NavigateFn`

Programmatic SPA navigation.

```tsx
const nav = useNavigate();
await nav('/dashboard');          // navigate to path
await nav();                      // refresh current page
await nav(-1);                    // go back
```

### `<Link href="...">`

SPA-aware anchor that prefetches on hover.

```tsx
import { Link } from '@builder.io/qwik-city';

<Link href="/about">About us</Link>
<Link href="/blog" prefetch={false}>Blog</Link>
```

---

## `routeLoader$` — server data loading

Loads data on the server before the page renders. Available to any component in
the same route subtree.

```tsx
// src/routes/product/[id]/index.tsx
import { routeLoader$ } from '@builder.io/qwik-city';

export const useProduct = routeLoader$(async (event) => {
  const product = await db.products.findById(event.params.id);
  if (!product) return event.fail(404, { message: 'Not found' });
  return product;          // TypeScript-inferred return type
});

export default component$(() => {
  const product = useProduct();   // Readonly<Signal<Product>>
  return <h1>{product.value.name}</h1>;
});
```

### RequestEvent properties

| Property | Type | Description |
| --- | --- | --- |
| `params` | `Record<string, string>` | URL dynamic segments |
| `url` | `URL` | Full request URL |
| `method` | `string` | HTTP verb |
| `headers` | `Headers` | Request headers |
| `cookie` | `Cookie` | Cookie read/write API |
| `query` | `URLSearchParams` | Query string |
| `env` | `EnvGetter` | Environment variables |
| `sharedMap` | `Map` | Share data between middleware/loaders |
| `platform` | `object` | Platform-specific APIs |
| `request` | `Request` | Raw Web Request |

### `event.fail(status, data)` — returning errors

```tsx
if (!user) return event.fail(401, { message: 'Unauthorised' });
```

The component can check `signal.value.message` to detect a failure.

### Cross-loader access

```tsx
export const useRecommendations = routeLoader$(async (event) => {
  const product = await event.resolveValue(useProduct);
  return fetchRecommendations(product.id);
});
```

### Rules

- Export only from `layout.tsx` or `index.tsx` (or re-export from those files).
- Multiple loaders per file are fine.
- Loaders run after `on*` middleware handlers and before components render.
- Prefer over `useResource$` when data is needed for the initial SSR render.

---

## `routeAction$` — form mutations

Handle form submissions and other mutations on the server.

```tsx
import { routeAction$, zod$, z } from '@builder.io/qwik-city';

export const useAddItem = routeAction$(
  async (data, event) => {
    await db.items.create(data);
    throw event.redirect(302, '/items');
  },
  zod$({ name: z.string().min(1), qty: z.coerce.number().positive() })
);

export default component$(() => {
  const action = useAddItem();
  return (
    <Form action={action}>
      <input name="name" required />
      <input name="qty" type="number" required />
      {action.value?.failed && <p>{action.value.fieldErrors.name}</p>}
      <button type="submit">Add</button>
    </Form>
  );
});
```

### Without Zod validation

```tsx
export const useDelete = routeAction$(async (data, event) => {
  await db.items.delete(data.id as string);
});
```

### `action.value` — result after submission

```ts
action.value?.failed       // true if zod validation failed
action.value?.fieldErrors  // per-field error messages
action.value?.formErrors   // top-level form errors
```

On success, `action.value` is the return value of your handler.

### Programmatic submission

```tsx
const action = useMyAction();
await action.submit({ id: '123' });
```

---

## Middleware

Export `onRequest`, `onGet`, `onPost`, `onPut`, `onPatch`, `onDelete` from
`layout.tsx` or `index.tsx`.

```tsx
import type { RequestHandler } from '@builder.io/qwik-city';

export const onRequest: RequestHandler = async ({ next, cookie, redirect }) => {
  if (!cookie.get('session')) throw redirect(302, '/login');
  await next();
};
```

**Order**: outermost `layout.tsx` → inner `layout.tsx` → `index.tsx`.

### Key `RequestEvent` response methods

| Method | Description |
| --- | --- |
| `json(status, data)` | Send JSON response |
| `text(status, str)` | Send plain-text response |
| `html(status, str)` | Send HTML response |
| `send(Response)` | Send raw `Response` object |
| `redirect(status, url)` | Must be `throw`n |
| `error(status, msg)` | Must be `throw`n |
| `exit()` | Stop chain, must be `throw`n |
| `next()` | Call next middleware in chain |
| `cacheControl(opts)` | Set `Cache-Control` header |
| `getWritableStream()` | Streaming response |

### `sharedMap` — sharing data in the chain

```tsx
// In middleware / layout
event.sharedMap.set('user', loadedUser);

// In routeLoader$ or inner middleware
const user = event.sharedMap.get('user') as User;
```

### Cookies

```tsx
// Read
const token = event.cookie.get('token')?.value;
event.cookie.get('count')?.number();   // parse as number

// Write
event.cookie.set('session', jwt, {
  path: '/',
  secure: true,
  httpOnly: true,
  sameSite: 'Lax',
  maxAge: [30, 'days'],
});

// Delete
event.cookie.delete('session');
```

---

## Layouts

Layout files wrap all child routes. They use `<Slot />` to render the child
route content.

```tsx
// src/routes/layout.tsx
import { component$ } from '@builder.io/qwik';
import { Slot } from '@builder.io/qwik';

export default component$(() => (
  <main>
    <Nav />
    <Slot />   {/* child page renders here */}
    <Footer />
  </main>
));
```

Layouts can also export loaders, actions, and middleware handlers.

### Nested layouts

Layouts nest automatically by directory depth. Every layout must render
`<Slot />`.

### Named layouts

```text
src/routes/
├── (auth)/
│   ├── layout.tsx       # Layout for the auth group
│   └── login/
│       └── index.tsx
```

`(group)` folders group routes without affecting the URL.

---

## Pages — `head` export

Set `<head>` metadata per page.

```tsx
import type { DocumentHead } from '@builder.io/qwik-city';

export const head: DocumentHead = {
  title: 'My Page',
  meta: [
    { name: 'description', content: 'Page description' },
    { property: 'og:title', content: 'My Page' },
  ],
  links: [{ rel: 'canonical', href: 'https://example.com/my-page' }],
};
```

Dynamic head using loader data:

```tsx
export const head: DocumentHead = ({ resolveValue }) => {
  const product = resolveValue(useProduct);
  return { title: product.name };
};
```

---

## Endpoints (API routes)

Export only HTTP handlers (no default component):

```ts
// src/routes/api/posts/index.ts
import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ json }) => {
  json(200, await db.posts.findAll());
};

export const onPost: RequestHandler = async ({ parseBody, json }) => {
  const body = await parseBody();
  const post = await db.posts.create(body as NewPost);
  json(201, post);
};
```

---

## Environment variables

```tsx
// In middleware / loaders (server-side)
event.env.get('DATABASE_URL')

// In components (client-safe, prefixed with PUBLIC_)
import { server$ } from '@builder.io/qwik-city';
```

`.env` files (Vite conventions):

- `.env` — loaded always
- `.env.local` — local overrides (gitignored)
- `.env.production` — production only

Access client-safe vars in Vite via `import.meta.env.PUBLIC_*`.

---

## `server$` — arbitrary server functions

Call server-only code from a component without a full loader/action:

```tsx
import { server$ } from '@builder.io/qwik-city';

const getSecret = server$(async () => {
  return process.env.SECRET_KEY;
});

// In component
const secret = await getSecret();
```

---

## Redirects and error handling

```tsx
// From middleware/loader
throw event.redirect(302, '/login');
throw event.error(404, 'Not found');

// Error pages: src/routes/404.tsx or src/routes/[...all]/index.tsx
```

---

## Deployment adapters

Add with `pnpm run qwik add <adapter>`:

| Target | Adapter |
| --- | --- |
| Cloudflare Pages | `cloudflare-pages` |
| Cloudflare Workers | `cloudflare-workers` |
| Vercel Edge | `vercel-edge` |
| Netlify Edge | `netlify-edge` |
| AWS Lambda | `aws-lambda` |
| Azure Static Web Apps | `azure-swa` |
| Node.js (Express) | `node` |
| Bun | `bun` |
| Deno | `deno` |
| Firebase | `firebase` |
| Static Site | `static` |

Each adapter generates a build entry point and updates `vite.config.ts`.

---

## Streaming / deferred loaders

```tsx
export const useHeavyData = routeLoader$(async (event) => {
  // Return a promise — Qwik City will stream HTML and resolve later
  return event.defer(async () => {
    const data = await slowQuery();
    return data;
  });
});
```

---

## MDX pages

Files named `index.mdx` in `src/routes` are automatically rendered as pages.
You can import components and use frontmatter:

```mdx
---
title: My Article
---
import MyComponent from '~/components/MyComponent';

# Hello

<MyComponent />
```

---

## Useful hooks summary

| Hook | Package | Description |
| --- | --- | --- |
| `useLocation()` | qwik-city | Current URL, params, navigation state |
| `useNavigate()` | qwik-city | Programmatic SPA navigation |
| `useDocumentHead()` | qwik-city | Access current `<head>` data |
| `useContent()` | qwik-city | MDX / menu content |
| `useQwikCityEnv()` | qwik-city | Raw env context (advanced) |

---

## Caching responses

Use `cacheControl` in any request handler to set HTTP cache headers:

```tsx
// src/routes/layout.tsx
import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ cacheControl }) => {
  cacheControl({
    public: true,
    maxAge: 5,                          // revalidate after 5s
    staleWhileRevalidate: 60 * 60 * 24 * 7, // serve stale for up to 1 week
  });
};
```

Override caching for specific routes by adding a nested layout that calls
`cacheControl` with `maxAge: 0, staleWhileRevalidate: 0`.

For CDNs that strip `Cache-Control` headers (e.g. Vercel Edge), pass a second
argument with the CDN-specific header name:

```tsx
cacheControl({ maxAge: 5, staleWhileRevalidate: 3600 }, 'CDN-Cache-Control');
```

---

## Error handling

### `ServerError`

Throw `ServerError` from loaders or `server$` to return custom status codes
and payloads to the client:

```tsx
import { ServerError } from '@builder.io/qwik-city/middleware/request-handler';

export const useProduct = routeLoader$(async (ev) => {
  const product = await db.get(ev.params.id);
  if (!product) throw new ServerError(404, 'Not found');
  // or use the helper:
  if (!product) throw ev.error(404, 'Not found');
  return product;
});

// In server$, the caught error has the payload as its value
const getPrices = server$(() => {
  if (!auth()) throw new ServerError(401, { code: 'UNAUTHORIZED' });
  return fetch('/api/prices');
});
```

On the client, `ServerError` payloads are deserialized as the caught error.

### Global error interceptor middleware

```tsx
// src/routes/plugin@errors.ts
import { type RequestHandler } from '@builder.io/qwik-city';
import { RedirectMessage, ServerError } from '@builder.io/qwik-city/middleware/request-handler';
import { isDev } from '@builder.io/qwik/build';

export const onRequest: RequestHandler = async ({ next }) => {
  try {
    return await next();
  } catch (err) {
    if (err instanceof RedirectMessage) throw err; // pass through redirects
    if (err instanceof ServerError) throw err;     // pass through known errors
    console.error('Unexpected error', err);
    if (isDev) throw err;
    throw new ServerError(500, 'Internal server error');
  }
};
```

---

## Re-exporting loaders

`routeLoader$` and `routeAction$` must be declared (or re-exported) from a
route boundary file (`index.tsx`, `layout.tsx`, or `plugin.tsx`).

To share logic across routes, define the loader in a shared file and re-export
it at the route boundary:

```ts
// src/shared/loaders.ts
export const useCurrentUser = routeLoader$(async () => { /* ... */ });
```

```tsx
// src/routes/dashboard/index.tsx
export { useCurrentUser } from '~/shared/loaders'; // re-export
export default component$(() => {
  const user = useCurrentUser(); // then consume as normal
  return <p>Hello {user.value.name}</p>;
});
```

For third-party components that use `routeLoader$` internally, also manually
call the hook at the route boundary so the optimizer can detect it:

```tsx
export { useThirdPartyLoader } from 'third-party-lib'; // re-export
export default component$(() => {
  useThirdPartyLoader(); // register so optimizer sees it
  return <ThirdPartyComponent />;
});
```

---

## `validator$` — custom request validators

`validator$` runs on the server before the action/loader executes. Useful for
auth guards, rate limiting, or request-level checks.

```tsx
import { routeAction$, validator$ } from '@builder.io/qwik-city';

export const useAction = routeAction$(
  async (data) => ({ result: data }),
  validator$(async (ev) => {
    if (ev.query.get('secret') !== process.env.SECRET) {
      return { success: false, error: { message: 'Unauthorized' } };
    }
    return { success: true };
  }),
);
```

Multiple validators can be chained — they execute in reverse order
(last to first). If a validator returns `data` in its success object, that
data is passed to the next validator.

For actions, `zod$()` must be the **second** argument, followed by any
`validator$()` calls:

```tsx
export const useAction = routeAction$(handler, zod$({...}), validator$(...));
```

---

## Complex forms (dot-notation inputs)

Nested objects and arrays in `FormData` are parsed via dot/index notation:

```html
<input name="person.name" value="Sam" />
<input name="person.pets.0" value="cat" />
<input name="person.pets.1" value="dog" />
```

Parses to: `{ person: { name: 'Sam', pets: ['cat', 'dog'] } }`

Use `z.object` / `z.array` in your `zod$` schema to validate nested data.
`fieldErrors` keys match the input name (e.g., `"person.email"`).

---

## Advanced routing

### Custom 404 pages

Create `src/routes/404.tsx` for a site-wide custom 404 page. Add
`src/routes/account/404.tsx` for a scoped 404 that only applies to
`/account/*` routes. Custom 404 pages are statically generated at build time.

### Grouped layouts `(name)/`

A directory wrapped in parentheses is excluded from the URL:

```text
src/routes/(account)/profile/index.tsx  =>  /profile  (not /account/profile)
```

Used to share a layout without adding a URL segment.

### Named layouts `layout-name.tsx` + `index@name.tsx`

```text
layout-narrow.tsx      # named layout
contact/index@narrow.tsx  # uses layout-narrow.tsx
```

### Plugin files

`src/routes/plugin.ts` and `src/routes/plugin@name.ts` run before any layout.
Multiple plugin files execute in alphabetical order of the `@name`. They are
the right place for global auth checks, logging, etc.

---

## Request handling / cookie API

`RequestEvent` is available in all request handlers. Key fields:

| Field | Type | Description |
| ------- | ------ | ------------- |
| `request` | `Request` | Native fetch `Request` |
| `url` | `URL` | Parsed URL |
| `params` | `Record<string, string>` | Route params |
| `cookie` | `Cookie` | Cookie helpers |
| `headers` | `Headers` | Request headers |
| `env` | `EnvGetter` | Environment variables |
| `platform` | `object` | Platform-specific data (Cloudflare, etc.) |
| `next` | `() => Promise<void>` | Call next middleware |
| `redirect(status, url)` | — | Throw a redirect |
| `error(status, msg)` | — | Throw an HTTP error |
| `cacheControl(opts)` | — | Set cache headers |

### Cookie API

```tsx
const val = cookie.get('session');   // CookieValue | null
val?.value;                          // raw string
val?.json<T>();                      // JSON.parse
val?.number();                       // Number()

cookie.set('session', token, {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
  path: '/',
  maxAge: [7, 'days'],
});

cookie.delete('session');
cookie.has('session');               // boolean
```

---

## Redirects

```tsx
export const onGet: RequestHandler = async ({ redirect, cookie }) => {
  if (!isAuth(cookie.get('token'))) {
    throw redirect(302, '/login');
  }
};
```

Common status codes: `301` permanent, `302` found, `307` temp (preserves method),
`308` permanent (preserves method).

For managing many redirects (e.g. from a CMS), query a rules table in a root
layout `onGet` handler and `throw redirect(...)` when a rule matches.

---

## Static Site Generation (SSG)

```bash
pnpm run qwik add static   # adds static adapter
pnpm run build.server      # generates dist/ with .html files
```

`adapters/static/vite.config.ts` holds SSG config (`origin`, `outDir`).

For dynamic routes, export `onStaticGenerate` from the route file:

```tsx
export const onStaticGenerate: StaticGenerateHandler = async ({ env }) => {
  const ids = await loadIds({ apiKey: env.get('API_KEY') });
  return { params: ids.map(id => ({ id })) };
};
```

---

## Speculative module fetching

After SSR, Qwik reads the bundle graph (`q-bundle-graph-*.json`) and
preloads chunks that are likely needed for current interactions using
`<link rel="modulepreload">`. This happens continuously as users interact.
Reduces network waterfalls because Qwik knows the full module graph and can
prefetch all dependencies at once, rather than sequentially.

Only active in production/preview builds — dev mode lacks the bundle graph.

---

## HTML attributes (`containerAttributes`)

Add attributes to the `<html>` container in `src/entry.ssr.tsx`:

```tsx
export default function (opts: RenderToStreamOptions) {
  return renderToStream(<Root />, {
    manifest,
    ...opts,
    containerAttributes: {
      lang: 'en-us',
      ...opts.containerAttributes,
    },
  });
}
```

Can use `opts.serverData?.qwikcity.params` for dynamic values (e.g., RTL
detection from a locale route param).
