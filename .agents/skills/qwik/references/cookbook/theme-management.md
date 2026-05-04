# Cookbook: Theme Management (Dark / Light)

> Source: `packages/docs/src/routes/docs/cookbook/theme-management/index.mdx`

## Setup (Tailwind CSS v4)

```css
/* global.css */
@import "tailwindcss";
@custom-variant dark (&:where(.dark, .dark *));
```

## Prevent flash-of-wrong-theme

Add a synchronous inline script to `<head>` in `root.tsx` — it runs before any rendering:

```tsx
// root.tsx — inside <head>
<script
  dangerouslySetInnerHTML={`
    (function() {
      function setTheme(t) {
        document.documentElement.classList.remove('light', 'dark');
        document.documentElement.classList.add(t);
        localStorage.setItem('theme', t);
      }
      const stored = localStorage.getItem('theme');
      if (stored) { setTheme(stored); }
      else if (window.matchMedia('(prefers-color-scheme: dark)').matches) { setTheme('dark'); }
      else { setTheme('light'); }
    })();
  `}
/>
```

## Toggle component

```tsx
import { component$ } from '@builder.io/qwik';

export const ThemeToggle = component$(() => (
  <button
    onClick$={() => {
      const isDark = document.documentElement.classList.contains('dark');
      const next = isDark ? 'light' : 'dark';
      document.documentElement.classList.replace(isDark ? 'dark' : 'light', next);
      localStorage.setItem('theme', next);
    }}
  >
    Toggle theme
  </button>
));
```

## SSG considerations

- `useVisibleTask$` runs **after** render → too late (causes flicker).
- The inline script in `<head>` runs synchronously → no flicker on SSG pages.
- Nonces do **not** work with SSG (no per-request server to generate them).

## CSP options

| Option | Security | Notes |
| -------- | ---------- | ------- |
| `'unsafe-inline'` in `script-src` | ⚠️ Lower | Simplest for static sites |
| SHA-256 hash of the inline script | ✅ Better | Calculate with `openssl dgst -sha256` |
| Nonces | ✅ Best | SSR only, not SSG |

## Troubleshooting

- **Theme flickers**: Ensure script is in `<head>`, not `<body>`, and has no `async`/`defer`.
- **Wrong icon initially**: Use CSS classes (`dark:hidden` / `dark:block`) for icon visibility — avoids state sync issues.
