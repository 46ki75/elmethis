# Integration: Icons

> Source: `packages/docs/src/routes/docs/integrations/icons/index.mdx`

## Option 1: `@qwikest/icons` (npm package)

```bash
pnpm install @qwikest/icons
```

Available icon sets:

| Prefix | Set |
| -------- | ----- |
| `Bs` | Bootstrap Icons |
| `Go` | Octicons (GitHub) |
| `Hi` | Heroicons (Tailwind) |
| `In` | Iconoir |
| `Io` | Ionicons (Ionic) |
| `Lu` | Lucide (superset of Feather) |
| `Mo` | Mono Icons |
| `Si` | Simple Icons (brand logos) |
| `Tb` | Tabler Icons |

```tsx
import { LuRocket } from '@qwikest/icons/lucide';

export const MyComponent = component$(() => (
  <div style={{ color: 'red', fontSize: '40px' }}>
    <LuRocket />
  </div>
));
```

Icon size and color are inherited from CSS by default.

## Option 2: `icones.js.org`

Browse 180,000+ icons from [icones.js.org](https://icones.js.org/). Click the **Qwik** button to copy a component directly:

```tsx
import type { PropsOf } from '@builder.io/qwik';

export function MyIcon(props: PropsOf<'svg'>, key: string) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 12 12" {...props} key={key}>
      <path fill="#888" d="..." />
    </svg>
  );
}
```

Powered by Iconify — includes Material Design, Phosphor, Remix, Carbon, Bootstrap, Tabler, Feather, Fluent, and many more.

## Key points

- Prefer `@qwikest/icons` for typed, tree-shakeable icons via npm.
- Use `icones.js.org` for one-off icons or sets not in the npm package.
