# SolidStart

Read this reference for `@solidjs/start`, file-based routing, server functions,
middleware, SSR, hydration, API routes, configuration, and deployment.
Also read `router.md` for route data APIs and `meta.md` for document metadata.

## Version Gate

Classify SolidStart before editing configuration or server imports:

| Concern | SolidStart v1 | SolidStart v2 |
| --- | --- | --- |
| Framework config | `app.config.ts`, `defineConfig` | `vite.config.ts`, `solidStart()` |
| Runtime | Vinxi/Nitro | Vite plugin; no direct Vinxi dependency |
| HTTP helpers | `vinxi/http` | `@solidjs/start/http` |
| Middleware | `onRequest`/`onBeforeResponse` object | H3 middleware arrays; object form deprecated |

SolidStart v2 documentation is incomplete and currently pre-release. Never copy
configuration, middleware, HTTP imports, or environment types across versions;
verify installed declarations.

## Application Shape

Inspect the existing project rather than assuming a layout. Current projects
commonly define the application shell in `src/app.tsx`, route files below
`src/routes`, and framework configuration in the version-specific file listed
above.

A typical app composes `Router` from `@solidjs/router` with `FileRoutes` from
`@solidjs/start/router`. The router root is an appropriate place for shared
providers and a `<Suspense>` boundary around `props.children`. Metadata must be
under `MetaProvider`.

File and directory names encode paths, dynamic parameters, nesting, and route
groups. Examine neighboring files before adding a route because conventions
and framework versions can affect exact naming.

Common conventions include `index.tsx`, `[id].tsx`, `[[id]].tsx`, and
`[...slug].tsx` for index, required, optional, and catch-all routes. Same-name
files can provide directory layouts; `(group)` directories organize routes
without adding a URL segment, while parenthesized escaped-layout forms can
change nesting without changing the URL. Confirm less common forms against the
installed version and generated route output. A default export creates UI;
HTTP method exports create an API route.

## Route Data

For current code, define reusable reads with `query` from `@solidjs/router` and
consume them with `createAsync`. Export a `route` object with `preload` when
navigation should start the query before rendering.

```tsx
import {
  createAsync,
  query,
  type RouteDefinition,
} from "@solidjs/router";

const getProject = query(async (id: string) => {
  "use server";
  return loadProjectForCurrentUser(id);
}, "project");

export const route = {
  preload: ({ params }) => getProject(params.id),
} satisfies RouteDefinition;

export default function ProjectPage(props: { params: { id: string } }) {
  const project = createAsync(() => getProject(props.params.id));
  return <h1>{project()?.name}</h1>;
}
```

Put `"use server"` inside a `query` or `action` fetcher. Do not place a file-level
directive around a module that exports a query wrapper needed by the client.
Keep non-tree-shakeable database and server-runtime imports in server-only
modules. The directive creates a transport/compiler boundary, not a trust
boundary: validate arguments, authenticate, authorize, and return only
serializable public data.

## Mutations

Use `action` from `@solidjs/router` for mutations that integrate with Router
forms, submission state, redirects, and query revalidation.

- Parse and validate `FormData` on the server.
- Derive user identity and permissions from server request context.
- Bind a route identifier with `action.with(id)` when useful, but authorize it
  again in the action.
- Return structured validation failures in the style already used by the
  project; redirect or revalidate after success as appropriate.
- Prevent duplicate mutations when pending state should disable resubmission.
- For validation failures that should not refresh data, return Router `json`
  with an empty revalidation list; target successful refreshes with query keys.

## Request Boundaries

- Treat every server function, route, and middleware invocation as untrusted
  input crossing a network boundary.
- Keep request-specific state local to the request or its context.
- Avoid module-level mutable stores, users, locale, and authorization state;
  server modules serve concurrent requests.
- Use server-only environment access and avoid exposing private variables to
  client code.
- Set cache headers intentionally for personalized and public responses.
- For cookie-authenticated unsafe methods, enforce CSRF protection. At minimum
  validate trusted `Origin` and strict `Referer`; prefer a robust token pattern
  where appropriate.
- Configure cookies deliberately with `Secure`, `HttpOnly`, `SameSite`, path,
  expiry, and TLS requirements. Middleware may populate identity, but queries,
  actions, and API handlers must enforce authorization themselves.

## Request Context and Serialization

Read the current request with `getRequestEvent()` from the version-appropriate
Solid web package. Keep identity and other request state in typed `event.locals`
rather than globals. Cookie/session helpers are server-only; session secrets
must meet the installed runtime's strength requirements. Session writes affect
headers and therefore must finish before streaming flushes.

Server-function values cross a serialization boundary. Validate payloads and
return intentional DTOs rather than database/runtime instances. SolidStart uses
Seroval-based serialization; v1 and v2 differ in defaults and supported direct
payloads. `js` mode has CSP `unsafe-eval` consequences, while `json` mode fits a
strict CSP. Check versioned serialization docs before changing the mode.

## Middleware and API Routes

Create middleware with `createMiddleware` from
`@solidjs/start/middleware`. In v1, use `onRequest` for early request processing
and `onBeforeResponse` for response adjustments. In v2, prefer the documented
H3 middleware-array form. Keep middleware narrow and ensure early responses are
deliberate.

API routes export HTTP methods such as `GET`, `POST`, `PATCH`, and `DELETE` and
receive `APIEvent`, including `request` and route `params`. Return standard
`Response` objects, `Response.json`, or an appropriate Router response helper.
V2 handles `HEAD` through `GET` when no explicit handler exists. Validate
methods, content types, authentication, authorization, CORS, and CSRF rather
than treating the API file as trusted internal code.

## SSR and Hydration

- Render deterministic initial markup on server and client.
- Defer browser-only APIs to `onMount` or a client-only boundary.
- Place Suspense around async route content to coordinate streaming and
  hydration.
- Avoid random values, current time, locale-dependent output, or mutable
  singleton state in initial render unless serialized consistently.
- Ensure metadata and preload calls participate in the server render.
- Use `deferStream: true` for data that may redirect, mutate response headers or
  sessions, or must appear in the initial SEO-visible response.

## Configuration and Deployment

SolidStart deployment is runtime/preset- and version-sensitive. Read the actual
framework config, scripts, runtime, and target platform before changing
rendering mode. In v1, inspect `server.prerender.routes` and `crawlLinks` for
static output; do not assume server functions, sessions, or request-specific
rendering work after prerendering. V2 deployment/prerender guidance may still
refer to v1 concepts, so verify installed APIs. Test the production build and a
representative server request when possible.
