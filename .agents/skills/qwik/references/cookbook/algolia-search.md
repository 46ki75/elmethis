# Cookbook: Algolia Search

> Source: `packages/docs/src/routes/docs/cookbook/algolia-search/index.mdx`

## Overview

Algolia is a hosted search platform. To use it in Qwik, obtain API credentials from your Algolia account and store them as Vite environment variables.

## Environment variables

```bash
# .env
VITE_ALGOLIA_INDEX=
VITE_ALGOLIA_APP_ID=
VITE_ALGOLIA_SEARCH_KEY=   # public — safe to expose to the browser
```

## Pattern

1. Create a `useSignal` for the search term and a `useSignal` for the results.
2. Wrap the Algolia REST call in a `$`-delimited function so it is lazy-loaded.
3. Trigger on `onKeyDown$` (Enter key) or a button `onClick$`.

```tsx
import { $, component$, useSignal } from '@builder.io/qwik';

type Hit = { type: string; anchor?: string; content?: string; url: string };

export default component$(() => {
  const term = useSignal('');
  const hits = useSignal<Hit[]>([]);

  const search = $(async (query: string) => {
    const url = new URL(
      `/1/indexes/${import.meta.env.VITE_ALGOLIA_INDEX}/query`,
      `https://${import.meta.env.VITE_ALGOLIA_APP_ID}-dsn.algolia.net`
    );
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Algolia-Application-Id': import.meta.env.VITE_ALGOLIA_APP_ID!,
        'X-Algolia-API-Key': import.meta.env.VITE_ALGOLIA_SEARCH_KEY!,
      },
      body: JSON.stringify({ query }),
    });
    const data = await res.json();
    hits.value = data.hits;
  });

  return (
    <input
      bind:value={term}
      onKeyDown$={(e) => e.key === 'Enter' && search(term.value)}
    />
  );
});
```

## Key points

- Use `VITE_` prefix so variables are available in browser code.
- The search-only API key is safe to expose — it cannot write data.
- Algolia REST endpoint: `POST /1/indexes/{index}/query`.
