# Integration: Storybook

> Source: `packages/docs/src/routes/docs/integrations/storybook/index.mdx`

## Installation

```bash
pnpm run qwik add storybook
```

Installs Storybook v7+ (Vite-native) and creates example stories.

## Run

```bash
pnpm run storybook
```

## Simple story

```tsx
// src/components/button.tsx
export const Button = component$<{ label: string }>(({ label }) => (
  <button>{label}</button>
));
```

```tsx
// src/components/button.stories.tsx
import type { Meta, StoryObj } from 'storybook-framework-qwik';
import { Button } from './button';

const meta: Meta<{ label: string }> = { component: Button };
export default meta;

export const Primary: StoryObj<{ label: string }> = {
  args: { label: 'Hello World' },
};
```

## Story with QwikCity (v1)

Wrap with `QwikCityMockProvider` when the component uses QwikCity hooks:

```tsx
import { QwikCityMockProvider } from '@builder.io/qwik-city';
import { WithLink } from './with-link';

export const Primary: StoryObj = {
  render: () => (
    <QwikCityMockProvider>
      <WithLink />
    </QwikCityMockProvider>
  ),
};
```

## Story with Qwik Router (v2)

In v2, `@builder.io/qwik-city` was renamed to `@qwik.dev/router`, and the mock
provider became `QwikRouterMockProvider`. Wrap stories that exercise router
hooks (`useLocation`, `Link`, etc.) with it:

```tsx
// src/components/with-link.tsx
import { component$ } from '@qwik.dev/core';
import { Link } from '@qwik.dev/router';

export const WithLink = component$(() => {
  return <Link href="https://google.com">Google Link</Link>;
});
```

```tsx
// src/components/with-link.stories.tsx
import type { Meta, StoryObj } from 'storybook-framework-qwik';
import { QwikRouterMockProvider } from '@qwik.dev/router';
import { WithLink } from './with-link';

const meta: Meta = { component: WithLink };
export default meta;

type Story = StoryObj;

export const Primary: Story = {
  render: () => (
    <QwikRouterMockProvider>
      <WithLink />
    </QwikRouterMockProvider>
  ),
};
```

## Key points

- Storybook v7+ has first-class Vite (and therefore Qwik) support.
- Use `storybook-framework-qwik` for type-safe story definitions.
- v1: `QwikCityMockProvider` from `@builder.io/qwik-city` is needed for
  components that use `useLocation`, `Link`, etc.
- v2: `QwikRouterMockProvider` from `@qwik.dev/router` replaces it. Check the
  project's `package.json` to pick the right one (see `qwik-v2.md` for the full
  package/identifier rename table).
