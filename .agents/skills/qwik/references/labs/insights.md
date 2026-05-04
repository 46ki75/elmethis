# 🧪 Labs: Insights

> Source: `packages/docs/src/routes/docs/labs/insights/index.mdx`  
> Stage: **prototyping**

## Purpose

Collect real user symbol-execution data to improve bundle grouping and prefetch order.

## Architecture

| Component | Role |
| ----------- | ------ |
| `<Insights>` component | Collects timing data per symbol in the browser |
| `qwikInsights` Vite plugin | Applies collected data during build |
| Builder.io database | Hosts the insights data (self-hostable) |

## Setup

### 1. Get an API key

Visit [insights.qwik.dev/app/add/](https://insights.qwik.dev/app/add/) and create an application.

### 2. Add the `<Insights>` component to `root.tsx`

```tsx
import { Insights } from '@builder.io/qwik-labs';

export default component$(() => (
  <QwikCityProvider>
    <head>
      <Insights publicApiKey={import.meta.env.PUBLIC_QWIK_INSIGHTS_KEY} />
    </head>
    ...
  </QwikCityProvider>
));
```

```env
PUBLIC_QWIK_INSIGHTS_KEY=your-key-here
```

### 3. Configure the Vite plugin

```ts
// vite.config.js
import { qwikInsights } from '@builder.io/qwik-labs/vite';
import { loadEnv } from 'vite';

export default defineConfig(async () => ({
  plugins: [
    qwikInsights({
      publicApiKey: loadEnv('', '.', '').PUBLIC_QWIK_INSIGHTS_KEY,
    }),
    // ...
  ],
}));
```

## Data collected

- Symbol execution timing.
- URL pathname.
- Random session ID (no PII).

## Key points

- Use **separate API keys** for preview and production — mixed data corrupts the import graph.
- If over-preloading occurs, create a new API key.
- Insights benefits: fewer waterfalls (colocated bundles) and priority-ordered prefetching.
