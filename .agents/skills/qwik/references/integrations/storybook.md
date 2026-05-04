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

## Story with QwikCity

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

## Key points

- Storybook v7+ has first-class Vite (and therefore Qwik) support.
- Use `storybook-framework-qwik` for type-safe story definitions.
- `QwikCityMockProvider` is needed for components that use `useLocation`, `Link`, etc.
