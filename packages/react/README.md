# @elmethis/react

React 19 component library for elmethis.

Components and hooks are being recreated to match the `@elmethis/qwik`
lead/base-reference implementation:

- design tokens come from `@elmethis/core` (`import "@elmethis/core/tokens.css"`);
- theming is native via CSS `light-dark()` + `color-scheme`;
- files are `kebab-case`, styles use CSS Modules with the `.elm-*` class
  convention, and specs are co-located.

## Scripts

| Script                | Purpose                                            |
| --------------------- | -------------------------------------------------- |
| `pnpm dev`            | Storybook dev server (port 19221)                  |
| `pnpm build`         | Build the library (`vite build`) + types (`tsc`)    |
| `pnpm test.unit`     | Unit specs (happy-dom + React Testing Library, SSR) |
| `pnpm test.browser`  | Browser specs (real Chromium via Playwright)        |
| `pnpm lint`          | ESLint                                              |
| `pnpm lint.css`      | Stylelint                                           |
| `pnpm fmt`           | Prettier                                            |

## Testing layers

- `*.spec.ts(x)` → unit (`pnpm test.unit`): pure logic, CSR via React Testing
  Library, and SSR via `renderToString`.
- `*.browser.spec.tsx` → browser (`pnpm test.browser`): real Chromium, only for
  behavior the unit DOM can't fake (native `<dialog>`/focus/layout, real Web
  APIs, `color-scheme`).
