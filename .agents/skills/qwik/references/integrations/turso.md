# Integration: Turso (libSQL / SQLite at the Edge)

> Source: `packages/docs/src/routes/docs/integrations/turso/index.mdx`

## Installation

```bash
pnpm run qwik add turso
```

Creates `src/lib/turso.ts` and adds to `.env.local`:

```bash
PRIVATE_TURSO_DATABASE_URL=
PRIVATE_TURSO_AUTH_TOKEN=
```

## Local development (file database)

```bash
sqlite3 foo.db
sqlite> create table todo (id integer not null, task text, done int default 0);
sqlite> insert into todo(id, task) values(1, "Go to the gym");
```

Set in `.env.local`:

```bash
PRIVATE_TURSO_DATABASE_URL=file:foo.db
```

When using file databases, import from `@libsql/client` (not `@libsql/client/web`), and no token is needed.

## Production (Turso cloud)

```bash
turso db show <database-name> --url    # → PRIVATE_TURSO_DATABASE_URL
turso db tokens create <database-name> # → PRIVATE_TURSO_AUTH_TOKEN
```

## Usage in Qwik

```ts
import { tursoClient } from '~/utils/turso';
import type { RequestEventBase } from '@builder.io/qwik-city';

export const useRouteLoader = routeLoader$(async (requestEvent: RequestEventBase) => {
  const client = tursoClient(requestEvent);
  const items = await client.execute('select * from table');
  return { items: items.rows };
});
```

Works in `routeLoader$`, `routeAction$`, `server$`, and endpoint handlers (`onGet`, `onPost`, etc.).

## Key points

- Turso is SQLite-compatible and deploys to 35+ global edge locations.
- `tursoClient` receives the `RequestEvent` to read env vars.
- Use `@libsql/client/web` for Cloudflare/edge runtimes, `@libsql/client` for Node/local files.
