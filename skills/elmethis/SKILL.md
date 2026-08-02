---
name: elmethis
description: Build and style Elmethis interfaces using its current published design tokens. Use for design AI agents creating or reviewing Elmethis CSS, components, pages, themes, prototypes, or visual states.
---

# Elmethis Design System

Use Elmethis as a small, restrained design system. Let semantic roles determine color; do not choose a hue before deciding what an element means.

## Available Tokens

Check all currently available Elmethis tokens from:

```text
https://cdn.jsdelivr.net/npm/@elmethis/core@latest/dist/tokens.css
```

Treat that stylesheet as the source of truth for available `--elmethis-*` custom properties. Do not rely on a cached token list or copy the resolved values into generated CSS.

## Stylelint

Install `stylelint` and `@elmethis/core` as development dependencies. Create `stylelint.config.mjs`:

```js
/** @type {import("stylelint").Config} */
export default {
  extends: ["@elmethis/core/stylelint"],
  rules: {
    // Add or override rules for the application here.
    "declaration-no-important": true,
  },
  ignoreFiles: ["dist/**"],
};
```

Run Stylelint against the application's CSS:

```sh
stylelint "src/**/*.css"
```

The Elmethis config enforces these design-system boundaries:

- Do not use hex colors, named colors, or direct color functions. Use a token.
- Use only `--elmethis-box-shadow-small`, `--elmethis-box-shadow-medium`, `--elmethis-box-shadow-large`, or `none` for `box-shadow`.
- Name classes in kebab-case, optionally with BEM `__element` and `--modifier` suffixes.

## Typography

Use sans-serif for interfaces and prose. Use monospace only for code, identifiers, and fixed-width data.

```css
body {
  font-family: var(--elmethis-font-family-sans);
}

code,
kbd,
pre,
samp {
  font-family: var(--elmethis-font-family-monospace);
}
```

The semantic font variables reference these primitive stacks:

- `--elmethis-primitive-font-family-sans`: `"DM Sans", "Zen Kaku Gothic New", -apple-system, BlinkMacSystemFont, "Hiragino Kaku Gothic ProN", Meiryo, sans-serif`
- `--elmethis-primitive-font-family-monospace`: `"DM Mono", "Source Code Pro", Menlo, Consolas, "DejaVu Sans Mono", "Zen Kaku Gothic New", monospace`

Do not repeat either stack in application CSS. Use the semantic font variables unless working inside the token implementation itself.

## Color Priority

Choose colors in this order:

1. Use a semantic role token whenever one fits.
2. Use a display preset for data visualization or intentionally color-named content.
3. Use a primitive token only as a last resort when no semantic role or display preset applies.

If the same primitive use appears more than once, add an appropriate semantic token to `packages/core/src/style/token.ts` instead of spreading primitive references through components.

### Neutral Text

| Role                                               | Token                             |
| -------------------------------------------------- | --------------------------------- |
| Normal body text                                   | `--elmethis-color-neutral`        |
| Description, metadata, placeholder, secondary text | `--elmethis-color-neutral-weak`   |
| Heading, label, emphasized text                    | `--elmethis-color-neutral-strong` |

Do not use weak text merely to reduce visual prominence when doing so makes important content difficult to read.

### Surfaces

| Role                                          | Token                             |
| --------------------------------------------- | --------------------------------- |
| Page or body background                       | `--elmethis-color-surface-base`   |
| Card, panel, menu, dialog, or other container | `--elmethis-color-surface-raised` |
| Header, inset region, or recessed background  | `--elmethis-color-surface-sunken` |
| Divider, border, or separator                 | `--elmethis-color-divider`        |

Prefer a divider over a shadow. When elevation is necessary, use the smallest box-shadow token that communicates it.

### Accents

Accent tokens are role pairs:

- Use `--elmethis-color-accent-link` for link text and `--elmethis-color-accent-link-surface` for a link-related background.
- Use `--elmethis-color-accent-{role}` for foregrounds and `--elmethis-color-accent-{role}-surface` for backgrounds.
- Available roles are `link`, `info`, `success`, `important`, `warning`, and `error`.
- Links may use `--elmethis-color-accent-link-visited` and `--elmethis-color-accent-link-surface-visited` for visited states.

Use the matching foreground and surface roles together for callouts, badges, and status regions. Pair status color with an icon or text label; never communicate state through color alone.

### Display Presets

Use `--elmethis-color-display-{color}` only when the color itself is meaningful, such as a chart series, legend, swatch, or user-selected label. Available colors are `red`, `orange`, `yellow`, `green`, `cyan`, `blue`, `purple`, and `magenta`. Each also has a matching `--elmethis-color-display-{color}-surface` token.

Example:

```css
.chart-series--cyan {
  color: var(--elmethis-color-display-cyan);
  background: var(--elmethis-color-display-cyan-surface);
}
```

Do not use display tokens as substitutes for semantic statuses. For example, an error uses `--elmethis-color-accent-error`, not `--elmethis-color-display-red`.

### Primitive Colors

Primitive colors follow `--elmethis-primitive-color-{color}-{variant}`, for example `--elmethis-primitive-color-cyan-500`. Primitive names encode appearance rather than meaning, so they are not stable component contracts. Keep any unavoidable primitive use local and explain why no semantic or display token fits.

## Foundation

Start pages and common elements from this baseline:

```css
:root {
  color-scheme: light dark;
  font-family: var(--elmethis-font-family-sans);
  color: var(--elmethis-color-neutral);
  background: var(--elmethis-color-surface-base);
}

body {
  margin: 0;
  color: var(--elmethis-color-neutral);
  background: var(--elmethis-color-surface-base);
}

h1,
h2,
h3,
h4,
h5,
h6,
strong {
  color: var(--elmethis-color-neutral-strong);
}

a {
  color: var(--elmethis-color-accent-link);
}

a:visited {
  color: var(--elmethis-color-accent-link-visited);
}

:focus-visible {
  outline: 2px solid var(--elmethis-color-primary);
  outline-offset: 2px;
}

.app-header {
  background: var(--elmethis-color-surface-sunken);
  border-block-end: 1px solid var(--elmethis-color-divider);
}

.card {
  background: var(--elmethis-color-surface-raised);
  border: 1px solid var(--elmethis-color-divider);
  box-shadow: var(--elmethis-box-shadow-small);
}

.card__description {
  color: var(--elmethis-color-neutral-weak);
}
```

Semantic tokens already adapt to light and dark color schemes. Test both schemes; do not replace them with component-level light/dark color overrides.

## Review Checklist

- Every referenced token exists in the current published stylesheet.
- Body, containers, headers, borders, and text use their designated semantic roles.
- Accent foregrounds and surfaces use matching semantic pairs.
- Display colors are reserved for color-named content and visualization.
- No primitive color is used where a semantic or display token applies.
- No literal color or unsupported box shadow bypasses Stylelint.
- Focus is visible, status is not conveyed by color alone, and both color schemes remain usable.
