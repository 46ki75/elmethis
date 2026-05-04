# Cookbook: Detect img onLoad (even when cached)

> Source: `packages/docs/src/routes/docs/cookbook/detect-img-tag-onload/index.mdx`

## Problem

The `onLoad$` event on `<img>` does not fire when the image is already in the browser cache. This means load-dependent logic may be silently skipped on repeat visits.

## Solution

Use a `ref` signal to get hold of the DOM element, then call `HTMLImageElement.decode()` inside
`useVisibleTask$`. `decode()` resolves as soon as the image data is available — whether it was
freshly fetched or served from cache.

```tsx
import { component$, useSignal, useVisibleTask$ } from '@builder.io/qwik';

export default component$(() => {
  const imgRef = useSignal<HTMLImageElement>();

  useVisibleTask$(() => {
    imgRef.value!.decode().then(() => {
      // Image is loaded and ready to display
      console.log('Image ready');
    });
  });

  return (
    <img ref={imgRef} src="/logos/qwik-logo.svg" height={200} width={200} />
  );
});
```

## Key points

- `useVisibleTask$` runs client-side after the element is visible in the DOM.
- `HTMLImageElement.decode()` returns a `Promise` that resolves regardless of cache state, unlike the `load` event.
- Attach the `ref` to the `<img>` element using Qwik's `ref` prop.
