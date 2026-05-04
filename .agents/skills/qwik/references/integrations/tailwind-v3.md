# Integration: Tailwind CSS v3

> Source: `packages/docs/src/routes/docs/integrations/tailwind-v3/index.mdx`

## Installation

```bash
pnpm run qwik add tailwind-v3
```

## What gets added

- `postcss.config.js`
- `tailwind.config.js`
- `.vscode/settings.json`

**`src/global.css`** (modified):

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

## Key points

- Requires PostCSS (configured automatically).
- `tailwind.config.js` controls theme, content paths, and plugins.
- For Tailwind v4, see `references/integrations/tailwind.md`.
