# Solid Router

Read this reference for `@solidjs/router` in plain Solid applications and for
the shared routing/data APIs used by SolidStart.

## Establish the Routing Mode

First determine whether routes are declared with `<Route>` components,
configuration objects, or SolidStart file routes. Preserve that mode.
SolidStart's `<FileRoutes>` is covered in `solidstart.md`.

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

## Actions and Forms

Define mutations with `action`. A native form can use the action as its
`action` prop and `method="post"`, preserving progressive enhancement. Use an
action's `.with(...)` helper to bind trusted route context or explicit leading
arguments where appropriate.

Use submission state APIs supported by the installed Router version for
pending UI and validation messages. Queries can revalidate after actions;
check whether the mutation needs targeted or explicit revalidation rather
than adding a second client-side cache.

On the server, authenticate and authorize independently of hidden form fields.
Validate all `FormData`, params, and search params.

## Boundaries and Navigation

- Put a suitable `<Suspense>` around route content using async primitives.
- Add an `<ErrorBoundary>` at the level where recovery is meaningful.
- Ensure route changes cannot display stale data for a previous parameter.
- Preserve focus, document title, and accessible navigation behavior.
- Do not manually mutate `history` or intercept anchors when Router APIs cover
  the behavior.

## Version Checks

Router data APIs have evolved. Before replacing older patterns, inspect the
installed version, declarations, and existing code. Do not mechanically mix
legacy route-data APIs with `query` and `createAsync` in one flow.
