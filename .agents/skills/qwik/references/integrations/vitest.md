# Integration: Vitest

> Source: `packages/docs/src/routes/docs/integrations/vitest/index.mdx`

## Installation

```bash
pnpm run qwik add vitest
```

Adds `vitest` to dependencies and creates `src/components/example/example.spec.tsx`.

## Writing unit tests

```tsx
import { createDOM } from '@builder.io/qwik/testing';
import { test, expect } from 'vitest';
import { ExampleTest } from './example';

test('renders ⭐ when flag=true', async () => {
  const { screen, render } = await createDOM();
  await render(<ExampleTest flag={true} />);
  expect(screen.outerHTML).toContain('⭐');
});

test('click increments counter', async () => {
  const { screen, render, userEvent } = await createDOM();
  await render(<ExampleTest flag={true} />);
  expect(screen.outerHTML).toContain('Count:0');
  await userEvent('.btn-counter', 'click');
  expect(screen.querySelector('span')!.innerHTML).toEqual('Count:1');
});
```

## QwikCity components

For components that use QwikCity hooks (`useLocation`, `Link`, etc.), wrap with `QwikCityMockProvider`:

```tsx
import { QwikCityMockProvider } from '@builder.io/qwik-city';
await render(<QwikCityMockProvider><MyComponent /></QwikCityMockProvider>);
```

## Key points

- `createDOM()` returns `{ screen, render, userEvent }`.
- `screen` is a DOM element representing the rendered output.
- `userEvent(selector, event)` simulates user interactions.
- File pattern: `*.spec.tsx` / `*.unit.ts`.
- Run all: `pnpm test.unit` | Run one: `pnpm vitest run <path>`.
