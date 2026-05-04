# 🧪 Labs: Typed Routes

> Source: `packages/docs/src/routes/docs/labs/typed-routes/index.mdx`  
> Stage: **prototyping**

## Option A: `qwikTypes` Vite plugin

### Installation

```bash
pnpm install github:QwikDev/qwik-labs-build#main
```

### Configuration

```ts
// vite.config.ts
import { qwikTypes } from '@builder.io/qwik-labs/vite';

export default defineConfig(() => ({
  plugins: [qwikTypes(), /* other plugins */],
}));
```

### Usage

Run `build` once to generate `~/routes.gen.d.ts` and `~/routes.config.tsx`.

```tsx
import { AppLink } from '~/routes.config';

<AppLink route="/your/[appParam]/link/" param:appParam="some-value">
  Link text
</AppLink>
```

---

## Option B: Declarative Routing (by Jack Herrington)

### Installation

```bash
pnpm dlx declarative-routing init
```

### Generated files

- `src/declarativeRoutes/makeRoute.ts` — page route factory
- `src/declarativeRoutes/index.ts` — all route imports
- `src/declarativeRoutes/hooks.ts` — `useParams`, `useSearchParams`

### Define a route

```ts
// src/routes/pokemon/[pokemonId]/routeInfo.ts
import * as z from 'zod';

export const Route = {
  name: 'PokemonDetail',
  params: z.object({ pokemonId: z.coerce.number() }),
};
```

### Use in component

```tsx
import { PokemonDetail } from '~/declarativeRoutes';

// As a Link component
<PokemonDetail.Link pokemonId={1}>Bulbasaur</PokemonDetail.Link>

// As a URL string
<Link href={PokemonDetail({ pokemonId: 1 })}>Bulbasaur</Link>

// Type-safe params
const { pokemonId } = useParams(PokemonDetail);
```

### Rebuild after route changes

```bash
pnpm dlx declarative-routing build
```

## Key points

- Both options provide TypeScript errors for invalid route params.
- Option A: simpler, less setup. Option B: more explicit schema with Zod.
