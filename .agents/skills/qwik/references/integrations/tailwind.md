# Integration: Tailwind CSS v4

> Source: `packages/docs/src/routes/docs/integrations/tailwind/index.mdx`

## Installation

```bash
pnpm run qwik add tailwind
```

## What gets modified

**`src/global.css`:**

```css
@import "tailwindcss";

/* Optional customizations */
/* @source "../node_modules/@your/ui-lib"; */
/* @import "tailwindcss" source("../src"); */
/* @import "tailwindcss" source(none); */
```

**`vite.config.ts`:**

```ts
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(() => ({
  plugins: [
    tailwindcss(),
    // ... other plugins
  ],
}));
```

## Key differences from v3

- No `tailwind.config.js` required.
- No PostCSS config required (uses the Vite plugin).
- Configuration via `@import "tailwindcss"` directives in CSS.

> For Tailwind v3, see `references/integrations/tailwind-v3.md`.
