# Integration: Drizzle ORM

> Source: `packages/docs/src/routes/docs/integrations/drizzle/index.mdx`

## Installation

```bash
pnpm run qwik add drizzle
```

Creates a `db/` folder with the Drizzle schema and installs dependencies.

## Usage in Qwik

Use Drizzle inside `routeLoader$`, `routeAction$`, or `server$`:

### List records

```tsx
import { routeLoader$ } from '@builder.io/qwik-city';
import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import { schema } from '../../../drizzle/schema';

export const useGetUsers = routeLoader$(async () => {
  const sqlite = new Database('./drizzle/db/db.sqlite');
  const db = drizzle(sqlite, { schema });
  return db.query.users.findMany();
});
```

### Get one record

```tsx
export const useGetUser = routeLoader$(async ({ params, status }) => {
  const userId = parseInt(params.userId, 10);
  const db = drizzle(new Database('./drizzle/db/db.sqlite'), { schema });
  const user = await db.query.users.findFirst({
    where: (users, { eq }) => eq(users.id, userId),
  });
  if (!user) status(404);
  return user;
});
```

### Insert a record

```tsx
export const useCreateUser = routeAction$(
  async (data) => {
    const db = drizzle(new Database('./drizzle/db/db.sqlite'), { schema });
    return db.insert(schema.users).values(data);
  },
  zod$({ name: z.string(), email: z.string().email() })
);
```

## Key points

- Drizzle is SQL-first — if you know SQL, you know Drizzle.
- Works in serverless environments.
- Schema is defined in TypeScript; CLI auto-generates migrations.
- Do not use Drizzle in component code — only in server-side Qwik APIs.
