# Cookbook: `sync$()` Synchronous Events

> Source: `packages/docs/src/routes/docs/cookbook/sync-events/index.mdx`

## Problem

Qwik processes events asynchronously, so `event.preventDefault()` and `event.stopPropagation()` do not work from a regular `$()` handler.

## `sync$()` caveats

1. Cannot close over any Qwik state.
2. Cannot call other functions declared in scope or imported.
3. Is serialized into HTML — keep it small.

## Pattern: split into `sync$` + `$`

Use `element.dataset` attributes to pass state into `sync$()`:

```tsx
import { component$, useSignal, sync$, $ } from '@builder.io/qwik';

export default component$(() => {
  const shouldPreventDefault = useSignal(true);

  return (
    <a
      href="https://example.com"
      target="_blank"
      data-should-prevent-default={shouldPreventDefault.value}
      onClick$={[
        // 1. sync part — reads from dataset, no Qwik state access
        sync$((e: MouseEvent, target: HTMLAnchorElement) => {
          if (target.hasAttribute('data-should-prevent-default')) {
            e.preventDefault();
          }
        }),
        // 2. async part — can access Qwik state freely
        $(() => {
          console.log(shouldPreventDefault.value ? 'Prevented' : 'Not Prevented');
        }),
      ]}
    >
      Open Link
    </a>
  );
});
```

## Alternative: `preventdefault:{eventName}` attribute

For simply preventing default behavior without any logic, use the HTML attribute:

```tsx
<a href="..." preventdefault:click>Link</a>
<div preventdefault:dragover preventdefault:drop>Drop zone</div>
```

## Key points

- `sync$()` runs synchronously, enabling `preventDefault()` / `stopPropagation()`.
- Pass data from async Qwik state into `sync$()` via `data-*` attributes.
- Chain handlers as an array: `[sync$(...), $(...)]`.
- `sync$()` is still in **BETA**.
