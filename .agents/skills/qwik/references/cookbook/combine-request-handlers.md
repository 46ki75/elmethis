# Cookbook: Combine Request Handlers

> Source: `packages/docs/src/routes/docs/cookbook/combine-request-handlers/index.mdx`

## Problem

Multiple middleware functions (e.g., connect to DB, load the current user) must be called in a specific order. Manually nesting them is complex.

## Solution: `combineRequestHandlers`

A utility that chains `RequestHandler` functions, honouring the `next()` call order (wrapping / unwinding like Express middleware):

```tsx
import type { RequestHandler } from '@builder.io/qwik-city';

/**
 * Call order (given handlers A, B, C):
 *   A-before → B-before → C-before → next() → C-after → B-after → A-after
 */
export const combineRequestHandlers =
  (...handlers: RequestHandler[]): RequestHandler =>
  async (originalContext) => {
    let lastNext = originalContext.next;
    for (let i = handlers.length - 1; i >= 0; i--) {
      const currentHandler = handlers[i];
      const nextInChain = lastNext;
      lastNext = async () => {
        await currentHandler({ ...originalContext, next: nextInChain });
      };
    }
    await lastNext();
  };
```

## Usage

```ts
// src/routes/layout.tsx
import { combineRequestHandlers } from '~/utils/combine';
import { connectDB } from '~/middleware/db';
import { loadUser } from '~/middleware/user';

export const onRequest = combineRequestHandlers(connectDB, loadUser);
```

## Key points

- Handlers are iterated in **reverse** so the first handler is the outermost wrapper.
- Each handler gets a `next` function that calls the subsequent handler.
- Compatible with any `RequestHandler` signature (onRequest, onGet, etc.).
