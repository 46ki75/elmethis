# Qwik Library

This package provides reusable UI building blocks for the Qwik web framework.

## Directory structure

This package is one of the workspace packages managed by pnpm.

The package lives at `./packages/qwik`.

- `.storybook/` - Storybook configuration
- `lib/` - build output
- `lib-types/` - build output (TypeScript types)
- `src/` - source root
  - `assets/` - static assets
  - `components/` - Qwik components
    - `<category>/`
      - `elm-x.module.scss`
      - `elm-x.stories.tsx`
      - `elm-x.tsx`
  - `hooks/` - custom Qwik hooks
  - `styles/` - shared styles (SCSS)
  - `index.ts` - package exports (re-export components)

## Coding style

### Module structure

Each component module should include:

- **Component**: TypeScript JSX (`.tsx`)
- **Styles**: SCSS Modules (`.module.scss`)
- **Storybook**: a Storybook meta file (`.stories.tsx`)

### Component (TypeScript JSX)

File: `elm-my-something.tsx`

```tsx
import { component$ } from "@builder.io/qwik";

import styles from "./elm-my-something.module.scss";

export interface ElmMySomethingProps {
  placeholder?: string;
}

export const ElmMySomething = component$<ElmMySomethingProps>(
  ({ placeholder = "Howdy" }) => {
    return <div class={styles["elm-my-something"]}>{placeholder}</div>;
  },
);
```

### Styles (SCSS Modules)

File: `elm-my-something.module.scss`

```scss
.elm-my-something {
}
```

### Storybook

File: `elm-my-something.stories.tsx`

```tsx
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmMySomething } from "./elm-my-something";

const meta: Meta<typeof ElmMySomething> = {
  // Replace the <Category> placeholder
  title: "Components/<Category>/elm-my-something",
  component: ElmMySomething,
  tags: ["autodocs"],
  args: {},
};

export default meta;

type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
```
