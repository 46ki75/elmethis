# SolidStart

Read this reference for `@solidjs/start`, file-based routing, server functions,
middleware, SSR, hydration, API routes, configuration, and deployment.
Also read `router.md` for route data APIs and `meta.md` for document metadata.

## Application Shape

Inspect the existing project rather than assuming a layout. Current projects
commonly define the application shell in `src/app.tsx`, route files below
`src/routes`, and framework configuration in `app.config.ts`.

A typical app composes `Router` from `@solidjs/router` with `FileRoutes` from
`@solidjs/start/router`. The router root is an appropriate place for shared
providers and a `<Suspense>` boundary around `props.children`. Metadata must be
under `MetaProvider`.

File and directory names encode paths, dynamic parameters, nesting, and route
groups. Examine neighboring files before adding a route because conventions
and framework versions can affect exact naming.

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

Keep server-only imports inside modules and functions that the compiler can
isolate. The `"use server"` directive marks server execution in supported
contexts. Never return secrets or unrestricted database records merely because
the function itself runs on the server.

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

## Request Boundaries

- Treat every server function, route, and middleware invocation as untrusted
  input crossing a network boundary.
- Keep request-specific state local to the request or its context.
- Avoid module-level mutable stores, users, locale, and authorization state;
  server modules serve concurrent requests.
- Use server-only environment access and avoid exposing private variables to
  client code.
- Set cache headers intentionally for personalized and public responses.

## Middleware and API Routes

Create middleware with `createMiddleware` from
`@solidjs/start/middleware`. Use `onRequest` for early request processing and
`onBeforeResponse` for response adjustments. Keep middleware narrow because it
runs across many routes, and ensure early responses are deliberate.

For API routes, follow the installed SolidStart method-export conventions and
return standard `Response` objects or supported Router response helpers.
Validate methods, content types, authentication, and CORS rather than treating
the API file as trusted internal code.

## SSR and Hydration

- Render deterministic initial markup on server and client.
- Defer browser-only APIs to `onMount` or a client-only boundary.
- Place Suspense around async route content to coordinate streaming and
  hydration.
- Avoid random values, current time, locale-dependent output, or mutable
  singleton state in initial render unless serialized consistently.
- Ensure metadata and preload calls participate in the server render.

## Configuration and Deployment

SolidStart deployment is adapter- and version-sensitive. Read `app.config.ts`,
the installed adapter, runtime scripts, and target platform before changing
rendering mode or deployment settings. Verify both the production build and a
representative server request when possible.
