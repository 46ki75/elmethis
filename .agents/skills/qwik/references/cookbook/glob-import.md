# Cookbook: Glob Import (`import.meta.glob`)

> Source: `packages/docs/src/routes/docs/cookbook/glob-import/index.mdx`

## Why not dynamic `import()`?

Qwik's optimizer handles lazy-loading automatically. Using Vite's dynamic `import()` conflicts with the optimizer. Use `import.meta.glob` instead when you need to import many files from a directory.

## Pattern

```tsx
import {
  type Component,
  component$,
  useSignal,
  useTask$,
} from '@builder.io/qwik';

// Eagerly resolve all default exports from /src/examples/
const metaGlobComponents: Record<string, any> = await import.meta.glob(
  '/src/examples/*',
  { import: 'default' }
);

export const MetaGlobExample = component$<{ name: string }>(({ name }) => {
  const Comp = useSignal<Component<any>>();

  useTask$(async () => {
    Comp.value = await metaGlobComponents[`/src/examples/${name}.tsx`]();
  });

  return <>{Comp.value && <Comp.value />}</>;
});
```

## `import.meta.glob` options

| Option | Effect |
| -------- | -------- |
| `{ import: 'default' }` | Only import the default export |
| `{ query: '?raw' }` | Import as raw string |
| `{ eager: true }` | Import synchronously at module evaluation time |

## Key points

- `import.meta.glob` is a Vite compile-time feature that produces an object mapping file paths to loader functions.
- The result is `Record<string, () => Promise<any>>` by default (lazy) or `Record<string, any>` with `eager: true`.
- Use `useTask$` to call the loader and store the result in a signal.
