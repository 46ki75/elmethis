# Integration: Orama (Full-Text Search)

> Source: `packages/docs/src/routes/docs/integrations/orama/index.mdx`

## Installation

```bash
pnpm run qwik add orama
```

Creates a demo route at `/src/routes/orama`.

## Usage

Orama can run client-side or server-side. On the server, use it inside `routeLoader$`, `routeAction$`, or `server$`:

```ts
import { create, insert, search } from '@orama/orama';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useSearch = routeLoader$(async ({ query }) => {
  const db = create({ schema: { title: 'string', content: 'string' } });
  // Insert documents...
  const results = await search(db, { term: query.get('q') ?? '' });
  return results.hits;
});
```

## Key points

- Zero dependencies, works in any JavaScript runtime.
- TypeScript-native with full type inference.
- See [Orama docs](https://docs.oramasearch.com/) for schema definition, filters, and advanced search options.
