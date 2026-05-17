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

## Consumer setup

### `pkce-challenge` resolver workaround

The `ag-ui-client` components transitively depend on
`@modelcontextprotocol/sdk`, which statically imports
[`pkce-challenge`](https://www.npmjs.com/package/pkce-challenge). That
package's `exports` field doesn't include a `default` condition, so Vite's
resolver fails the client build even when the OAuth/PKCE code path is never
reached at runtime.

Until [`pkce-challenge`](https://github.com/crouchcd/pkce-challenge) ships a
fix upstream, alias it to a local stub in your `vite.config.ts`:

```ts
// vite.config.ts
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  resolve: {
    alias: {
      "pkce-challenge": fileURLToPath(
        new URL("./src/stubs/pkce-challenge.ts", import.meta.url),
      ),
    },
  },
});
```

```ts
// src/stubs/pkce-challenge.ts
export default async function pkceChallenge(): Promise<{
  code_verifier: string;
  code_challenge: string;
}> {
  throw new Error("pkce-challenge is stubbed in this build");
}

export async function verifyChallenge(): Promise<boolean> {
  throw new Error("pkce-challenge is stubbed in this build");
}
```

The `throw` is intentional — if the OAuth code path is ever reached at
runtime, you'll get a loud error instead of silent broken crypto. Omit the
alias if your app actually uses the MCP SDK's OAuth flow.

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

### Bulk Exports

We export all components and their prop types in `src/index.ts`.

```tsx
// | Code |
export {
  ElmCodeBlock,
  type ElmCodeBlockProps,
} from "./components/code/elm-code-block";
export { ElmKatex, type ElmKatexProps } from "./components/code/elm-katex";
export {
  ElmShikiHighlighter,
  type ElmShikiHighlighterProps,
} from "./components/code/elm-shiki-highlighter";

// | Containments |
export {
  ElmParallax,
  type ElmParallaxProps,
} from "./components/containments/elm-parallax";
```
