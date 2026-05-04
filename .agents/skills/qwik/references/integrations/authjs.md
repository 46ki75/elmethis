# Integration: Auth.js (`@auth/qwik`)

> Source: `packages/docs/src/routes/docs/integrations/authjs/index.mdx`

## Installation

```bash
pnpm run qwik add auth
```

Creates `src/routes/plugin@auth.ts` with example GitHub configuration.

## Configuration (`plugin@auth.ts`)

```ts
import { QwikAuth$ } from '@auth/qwik';
import GitHub from '@auth/qwik/providers/github';

export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(
  () => ({ providers: [GitHub] })
);
```

Environment variables:

```bash
AUTH_GITHUB_ID=
AUTH_GITHUB_SECRET=
AUTH_SECRET=   # openssl rand -base64 32
```

## Qwik API

### `useSession()`

A `routeLoader$` that returns the session object (or empty object):

```tsx
const session = useSession();
return <p>{session.value?.user?.email}</p>;
```

### `useSignIn()`

A `routeAction$` to initiate sign-in flow:

```tsx
const signIn = useSignIn();
// Programmatic:
signIn.submit({ providerId: 'github', options: { redirectTo: '/dashboard' } });
// Via form:
<Form action={signIn}>
  <input type="hidden" name="providerId" value="github" />
  <button>Sign In</button>
</Form>
```

### `useSignOut()`

```tsx
const signOut = useSignOut();
signOut.submit({ redirectTo: '/signedout' });
```

## Route protection

```ts
// layout.tsx or page index.tsx
export const onRequest: RequestHandler = (event) => {
  const session = event.sharedMap.get('session');
  if (!session || new Date(session.expires) < new Date()) {
    throw event.redirect(302, `/auth/signin?callbackUrl=${event.url.pathname}`);
  }
};
```

## REST endpoints (auto-generated)

| Endpoint | Purpose |
| ---------- | --------- |
| `GET /auth/signin` | Built-in sign-in page |
| `POST /auth/signin/:provider` | Start OAuth flow |
| `GET/POST /auth/callback/:provider` | OAuth callback |
| `GET /auth/signout` | Sign-out page |
| `POST /auth/signout` | Sign out (POST to prevent CSRF) |
| `GET /auth/session` | Returns session JSON |
| `GET /auth/csrf` | Returns CSRF token |
| `GET /auth/providers` | Lists configured providers |

## Migrating from `@builder.io/qwik-auth`

```diff
-import { serverAuth$ } from '@builder.io/qwik-auth';
+import { QwikAuth$ } from '@auth/qwik';
-export const { onRequest, useAuthSession, useAuthSignin, useAuthSignout } = serverAuth$(...);
+export const { onRequest, useSession, useSignIn, useSignOut } = QwikAuth$(...);
```

Auth routes changed: `/api/auth/` → `/auth/`.

## Node deployment note

Set these env vars so Node knows its own origin:

```bash
ORIGIN=https://your-app.example.com
PROTOCOL_HEADER=X-Forwarded-Proto
HOST_HEADER=X-Forwarded-Host
```
