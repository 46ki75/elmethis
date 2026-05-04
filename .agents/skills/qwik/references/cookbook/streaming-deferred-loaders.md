# Cookbook: Streaming / Deferred Loaders

> Source: `packages/docs/src/routes/docs/cookbook/streaming-deferred-loaders/index.mdx`

## Overview

By default, `routeLoader$` blocks rendering until its promise resolves. To stream HTML immediately and defer the data, return an **async function** from the loader instead of the data directly.

## Pattern

```tsx
import { Resource, component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useMyData = routeLoader$(async () => {
  // Returning an async function enables deferred / streaming mode
  return async () => {
    await delay(4_000);       // simulated slow data fetch
    return 'result ' + Math.random();
  };
});

export default component$(() => {
  const myData = useMyData();
  return (
    <>
      <div>BEFORE</div>
      <Resource
        value={myData}
        onResolved={(data) => <div>DATA: {data}</div>}
      />
      <div>AFTER</div>
    </>
  );
});
```

## How it works

1. The outer `routeLoader$` function resolves immediately, returning an async function.
2. Qwik renders the page up to the `<Resource>` boundary and streams that HTML.
3. The inner async function executes in the background; once resolved, `<Resource onResolved>` renders the data.
4. `BEFORE` and `AFTER` are visible immediately; `DATA:` appears after 4 seconds.

## Key points

- This is the Qwik equivalent of React's Suspense streaming.
- The deferred function runs on the **server** (not the client).
- `<Resource>` is required in the component to consume a streaming loader value.
