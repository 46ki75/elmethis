# Integration: PostCSS

> Source: `packages/docs/src/routes/docs/integrations/postcss/index.mdx`

## Installation

```bash
pnpm run qwik add postcss
```

Creates `postcss.config.js` with:

- **Autoprefixer** — adds vendor prefixes automatically.
- **PostCSS Preset Env** — modern CSS features with fallbacks.

## Default config

```js
// postcss.config.js
export default {
  plugins: {
    autoprefixer: {},
    'postcss-preset-env': {
      stage: 3,
      features: { 'nesting-rules': true },
    },
  },
};
```

## Adding plugins (e.g., CSSNano)

```bash
pnpm install cssnano
```

```js
module.exports = {
  plugins: {
    autoprefixer: {},
    'postcss-preset-env': { stage: 3 },
    cssnano: { preset: 'default' },
  },
};
```

## Key points

- PostCSS runs as part of the Vite build pipeline.
- Used by Tailwind v3 and Panda CSS — avoid duplicate configuration.
- See [postcss.org](https://postcss.org/docs/) for available plugins.
