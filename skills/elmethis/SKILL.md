---
name: elmethis
description: Configure Stylelint with the Elmethis rules. Use when an Elmethis user wants to lint their application's CSS.
---

# Elmethis Stylelint

Install `stylelint` and `@elmethis/core` as development dependencies using the project's package manager.

Create `stylelint.config.mjs`:

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

Run Stylelint against the application's CSS, for example:

```sh
stylelint "src/**/*.css"
```

## Available Variables

Import `@elmethis/core/tokens.css`, then inspect the custom properties on `:root` in browser DevTools. To locate the published CSS file directly, run:

```sh
node -p 'require.resolve("@elmethis/core/tokens.css")'
```

Prefer semantic variables such as `--elmethis-color-primary`; avoid using `--elmethis-primitive-*` directly.
