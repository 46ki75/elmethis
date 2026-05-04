# Integration: Supabase

> Source: `packages/docs/src/routes/docs/integrations/supabase/index.mdx`

## Installation

```bash
pnpm install @supabase/supabase-js supabase-auth-helpers-qwik
```

## Environment variables

```bash
PUBLIC_SUPABASE_URL=https://xxxxxxx.supabase.co
PUBLIC_SUPABASE_ANON_KEY=eyJhb.......
```

The `ANON_KEY` is safe to expose to the client.

## Server-side usage

Use `createServerClient` inside `routeLoader$`, `routeAction$`, or `server$`:

```tsx
import { routeLoader$ } from '@builder.io/qwik-city';
import { createServerClient } from 'supabase-auth-helpers-qwik';

export const useDBTest = routeLoader$(async (requestEv) => {
  const supabase = createServerClient(
    requestEv.env.get('PUBLIC_SUPABASE_URL')!,
    requestEv.env.get('PUBLIC_SUPABASE_ANON_KEY')!,
    requestEv
  );
  const { data } = await supabase.from('test').select('*');
  return { data };
});
```

## Key points

- `createServerClient` handles cookies and session management automatically.
- Passing the `requestEv` (RequestEvent) object enables SSR-aware auth helpers.
- Client-side usage is possible but misses server-side performance benefits.
