# Integration: Prisma ORM

> Source: `packages/docs/src/routes/docs/integrations/prisma/index.mdx`

## Installation

```bash
pnpm run qwik add prisma
```

Creates `prisma/` folder with schema and migration files.

## Usage in Qwik

Use `PrismaClient` inside `routeLoader$`, `routeAction$`, or `server$`:

### List records

```tsx
import { routeLoader$ } from '@builder.io/qwik-city';
import { PrismaClient } from '@prisma/client';

export const useGetUsers = routeLoader$(async () => {
  const prisma = new PrismaClient();
  return prisma.user.findMany();
});
```

### Get one record

```tsx
export const useGetUser = routeLoader$(async ({ params, status }) => {
  const prisma = new PrismaClient();
  const user = await prisma.user.findUnique({
    where: { id: parseInt(params.userId, 10) },
  });
  if (!user) status(404);
  return user;
});
```

### Create a record

```tsx
export const useCreateUser = routeAction$(
  async (data) => {
    const prisma = new PrismaClient();
    return prisma.user.create({ data });
  },
  zod$({ name: z.string(), email: z.string().email() })
);
```

## Key points

- Supports Postgres, MySQL, SQLite, MongoDB.
- Schema defined in `.prisma` files; CLI auto-generates types and migrations.
- Only use `PrismaClient` in server-side Qwik APIs (not component code).
- `PrismaClient` should be instantiated as a singleton in production (avoid connection exhaustion).
