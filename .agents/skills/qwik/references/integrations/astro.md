# Integration: Astro

> Source: `packages/docs/src/routes/docs/integrations/astro/index.mdx`

## Overview

Use Qwik components inside an Astro project via the `@qwikdev/astro` integration. **Qwik City APIs are not compatible with Astro** — use Astro's routing, pages, layouts, and data fetching instead.

## Create a new project

```bash
pnpm create @qwikdev/astro
```

## Add to an existing Astro project

```bash
pnpm dlx astro add @qwikdev/astro
```

## Manual installation

```bash
pnpm install @qwikdev/astro @builder.io/qwik
```

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import qwikdev from '@qwikdev/astro';

export default defineConfig({
  integrations: [qwikdev()],
});
```

## TypeScript config

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@builder.io/qwik"
  }
}
```

## Key points

- Qwik inside Astro uses JavaScript Streaming — Qwik components are islands.
- Do not use `routeLoader$`, `routeAction$`, `Link`, `useLocation`, etc. inside Qwik components when in Astro — use Astro's equivalents.
- See [github.com/QwikDev/astro](https://github.com/QwikDev/astro) for detailed documentation.
