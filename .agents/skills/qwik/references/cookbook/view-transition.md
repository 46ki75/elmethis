# Cookbook: View Transition API

> Source: `packages/docs/src/routes/docs/cookbook/view-transition/index.mdx`

## Overview

Qwik starts a View Transition automatically on SPA navigation. Animations can use CSS or the Web Animations API (WAAPI).

## CSS approach

```tsx
// Component: assign a unique view-transition-name per item
export default component$(({ list }) => (
  <ul>
    {list.map((item) => (
      <li key={item.id} style={{ viewTransitionName: `_${item.id}_` }}>
        ...
      </li>
    ))}
  </ul>
));
```

```css
/* Alias for all list items */
li { view-transition-class: animated-item; }

/* Animate items entering the new page */
::view-transition-new(.animated-item):only-child { animation: fade-in 200ms; }
/* Animate items leaving the old page */
::view-transition-old(.animated-item):only-child { animation: fade-out 200ms; }
```

### Restore whole-page transitions

Qwik sets `view-transition-name: none` on `:root` by default. To animate the full page:

```css
/* global.css */
html.transition { view-transition-name: root; }
```

```ts
// entry.ssr.tsx
containerAttributes: { class: 'transition' }
```

## Listening to the `qviewTransition` event

For logic that must run before the animation starts (e.g., only animate visible elements):

```tsx
useOnDocument('qviewTransition', sync$((event: CustomEvent<ViewTransition>) => {
  const transition = event.detail;
  const items = document.querySelectorAll('.item');
  for (const item of items) {
    if (!item.checkVisibility()) continue;
    item.dataset.hasViewTransition = 'true';
  }
}));
```

## WAAPI approach (precise timing)

```tsx
useOnDocument('qviewTransition', $(async (event: CustomEvent<ViewTransition>) => {
  const items = document.querySelectorAll<HTMLElement>('.item');
  const names = Array.from(items)
    .filter((el) => el.checkVisibility())
    .map((el) => el.style.viewTransitionName);

  await event.detail.ready; // wait for ::view-transition pseudo-element

  names.forEach((name, i) => {
    document.documentElement.animate(
      { opacity: 0, transform: 'scale(0.9)' },
      { pseudoElement: `::view-transition-old(${name})`, duration: 200, fill: 'forwards', delay: i * 50 }
    );
  });
}));
```

## Key points

- `ViewTransition` TypeScript interface requires TypeScript ≥ 5.6.
- `sync$()` is needed for handlers that must be synchronous (data collection before ready).
- Override `::view-transition-old` animation if using WAAPI to prevent double animation.
