# Integration: Panda CSS

> Source: `packages/docs/src/routes/docs/integrations/panda-css/index.mdx`

## Installation

```bash
pnpm run qwik add pandacss
```

Adds:

- `postcss.config.js`
- `panda.config.js`
- `.vscode/settings.json`

Modifies `src/global.css`:

```css
@layer reset, base, tokens, recipes, utilities;
```

## Key points

- Panda CSS generates atomic CSS at build time — zero runtime overhead.
- Type-safe styling API via `css()`, `cva()`, and recipe functions.
- Works with PostCSS (configured automatically).
- See [panda-css.com](https://panda-css.com/) for the full API.
