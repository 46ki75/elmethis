---
name: elmethis
description: Build and style Elmethis interfaces using its current published design system. Use for design AI agents creating or reviewing Elmethis CSS, components, pages, themes, prototypes, or visual states.
---

# Elmethis Design System

## Design Context

Read the generated DESIGN.md for the color scheme being designed:

```text
https://cdn.jsdelivr.net/npm/@elmethis/core@latest/dist/design/light/DESIGN.md
https://cdn.jsdelivr.net/npm/@elmethis/core@latest/dist/design/dark/DESIGN.md
```

Read both documents when the interface adapts to `color-scheme`. They define Elmethis visual intent and expose the same semantic roles with scheme-specific resolved values.

## Implementation Tokens

Check all currently available CSS custom properties from:

```text
https://cdn.jsdelivr.net/npm/@elmethis/core@latest/dist/tokens.css
```

Treat `tokens.css` as the implementation source of truth. DESIGN.md values are design context only; do not copy resolved colors, font stacks, or shadows into application CSS. Use the matching `--elmethis-*` custom properties instead.

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

The Elmethis config enforces these implementation boundaries:

- Use tokens instead of literal colors.
- Use only the supported Elmethis box-shadow tokens or `none`.
- Name classes in kebab-case, optionally with BEM `__element` and `--modifier` suffixes.
