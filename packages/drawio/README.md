# `@elmethis/draw.io`

A [diagrams.net](https://www.diagrams.net/) editor configuration generated from
the design tokens published by `@elmethis/core`.

## Use In diagrams.net

1. Build `@elmethis/core`, then this package.
2. Open **Extras > Configuration** in diagrams.net.
3. Paste the contents of `dist/draw.io-config.json` into the JSON tab.
4. Apply the configuration and reload the editor.

```sh
pnpm --filter @elmethis/core run build
pnpm --filter @elmethis/draw.io run build
```

The generated configuration uses explicit `light-dark()` color pairs with
simple adaptive colors, Elmethis color palettes and named color schemes, and
the Elmethis sans-serif fonts for shapes, connectors, standalone text, and SVG
font embedding.

## Package Export

The generated JSON is available from the package root or the explicit
`draw.io-config.json` subpath.

```ts
import config from "@elmethis/draw.io" with { type: "json" };
```

The package intentionally does not set `override`, editor layout, libraries, or
keyboard behavior. Those are user and deployment preferences rather than
Elmethis design tokens.
