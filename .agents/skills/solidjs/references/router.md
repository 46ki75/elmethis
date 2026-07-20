# Solid Router

Read this reference for `@solidjs/router` in plain Solid applications and for
the shared routing/data APIs used by SolidStart.

## Establish the Routing Mode

First determine whether routes are declared with `<Route>` components,
configuration objects, or SolidStart file routes. Preserve that mode.
SolidStart's `<FileRoutes>` is covered in `solidstart.md`.

Configuration routes are valid Router children; preserve them rather than
rewriting them as JSX:

```tsx
const routes: RouteDefinition[] = [{
  path: "/products",
  component: ProductsLayout,
  children: [{ path: "/:id", component: lazy(() => import("./Product")) }],
}];

<Router root={App}>{routes}</Router>;
```

Route paths may be arrays. Prefer `preload`; `load` and `rootLoad` are legacy
aliases. Inspect Router-level options such as `base`, `preload`,
`explicitLinks`, `actionBase`, and `transformUrl` before changing integration
behavior.

At the application root, `<Router>` supplies routing context. Its `root` prop
is the shared outer layout and receives route-section props including
`children`. Use `<A>` for links that should participate in router navigation,
active styling, and preload behavior.

## Route Structure

- Use static segments for fixed pages and `:param` segments for dynamic data.
- Keep parent routes focused on shared layouts and child outlets.
- Read dynamic values reactively through route props or `useParams`.
- Read and update query strings with `useSearchParams`; parse and validate
  external string values before treating them as domain data.
- Use `useNavigate` for imperative transitions caused by completed behavior,
  not as a replacement for ordinary links.
- Use `<Navigate>` for declarative redirects when rendering determines the
  destination.
- Use a named catch-all such as `path="*404"` when code needs the unmatched
  remainder. Use `HashRouter` only for client-side hash routing. For controlled
  tests or embedded flows, pass `createMemoryHistory()` to `MemoryRouter`.

## Code and Data Preloading

Router-managed anchors preload matched route code and route preload data on
intent by default. `usePreloadRoute(url)` preloads code but needs
`{ preloadData: true }` to invoke data preload. Nested lazy components outside
the route hierarchy need their own `.preload()`. Keep preload functions pure and
idempotent because SSR, hydration, hover, and focus can invoke them. A preloaded
query's short reuse window is not a durable application cache.

## Preload and Async Data

Current Router data APIs are imported from `@solidjs/router`:

```tsx
import {
  createAsync,
  query,
  type RouteDefinition,
} from "@solidjs/router";

const getProduct = query(async (id: string) => {
  const response = await fetch(`/api/products/${id}`);
  if (!response.ok) throw new Error("Unable to load product");
  return response.json() as Promise<{ id: string; name: string }>;
}, "product");

export const route = {
  preload: ({ params }) => getProduct(params.id),
} satisfies RouteDefinition;

export function Product(props: { params: { id: string } }) {
  const product = createAsync(() => getProduct(props.params.id));
  return <h1>{product()?.name}</h1>;
}
```

The preload and component must call the same query with the same meaningful
parameters. Preload warms navigation; `createAsync` creates the reactive read
used by rendering and Suspense.

Query names should be stable and specific. Validate responses and propagate
errors to an intentional boundary rather than converting every failure into
an empty success.

The query key combines its name and serialized arguments. Different query
functions with the same name and arguments share an entry, so names must be
globally specific and arguments consistently serializable. Server entries are
request-scoped; client entries live in a module cache and are retained or
evicted according to subscriptions and Router policy. Do not use query cache as
authorization or durable storage. `cache` is a deprecated alias for `query`.

`createAsync` options include `initialValue`, `name`, and `deferStream`; its
accessor also exposes `.latest`. Use `createAsyncStore` only when nested result
reconciliation is useful.

## Actions and Forms

Define mutations with `action`. A native form can use the action as its
`action` prop and `method="post"`, preserving progressive enhancement. Use an
action's `.with(...)` helper to bind trusted route context or explicit leading
arguments where appropriate.

Use `useSubmission` for the latest submission and `useSubmissions` for
concurrent submissions. Return a non-null typed value from every action path;
otherwise a completed submission is removed and an older validation result can
remain visible.

A successfully resolved action automatically revalidates active queries on the
page. For validation failures that must not revalidate, return
`json(result, { revalidate: [] })`. Use `query.keyFor(args...)` to target one
argument set and `query.key` for all sets. `json`, `reload`, and `redirect`
control result data, navigation, headers/status, and revalidation and may be
returned or thrown.

On the server, authenticate and authorize independently of hidden form fields.
Validate all `FormData`, params, and search params.

## Boundaries and Navigation

- Put a suitable `<Suspense>` around route content using async primitives.
- Add an `<ErrorBoundary>` at the level where recovery is meaningful.
- Ensure route changes cannot display stale data for a previous parameter.
- Preserve focus, document title, and accessible navigation behavior.
- Do not manually mutate `history` or intercept anchors when Router APIs cover
  the behavior.

Streaming commits response headers. Use
`createAsync(source, { deferStream: true })` when a server query can redirect,
set status or headers, update cookies/sessions, or provide SEO-critical content
that must be in the initial HTML.

## Version Checks

Router data APIs have evolved. Before replacing older patterns, inspect the
installed version, declarations, and existing code. Do not mechanically mix
legacy route-data APIs with `query` and `createAsync` in one flow.
