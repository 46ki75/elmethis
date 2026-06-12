# elmethis

## Workspace Overview

- The root is a pnpm workspace with packages under `packages/*`.
- Contains UI component libraries for `vue`, `react`, and `qwik`.

## Directory Structure

- `packages/copilotkit`: For internal testing. Speaks the AG-UI protocol.
- `packages/core`: (`@elmethis/core`) a common framework agnostic package which is used by each SPA component library.
- `packages/vue`: (`@elmethis/vue`) Vue 3 component library and Storybook package.
- `packages/react`: (`@elmethis/react`) React component library.
- `packages/qwik`: (`@elmethis/qwik`) Qwik component library.

## Design Tokens & Reference Implementation

- The canonical design tokens live in `@elmethis/core`. They are authored in
  `packages/core/src/style/token.ts` (two layers: primitive `--elmethis-primitive-*`
  raw values and semantic `--elmethis-*` roles that reference them) and emitted to
  `dist/tokens.css` via vanilla-extract (`scripts/build-tokens.ts`). Consume them
  as `import "@elmethis/core/tokens.css"`.
- Theming is **native**: every themed token is a CSS `light-dark()` value that
  resolves against the root's computed `color-scheme`. The default
  (`color-scheme: light dark`) follows the OS (`prefers-color-scheme`);
  `useElmethisTheme()` pins `color-scheme` on `<html>` to force a theme. The
  `data-theme` attribute is set too, but only the handful of _non-color_
  overrides that can't use `light-dark()` read it — it is not the primary
  switch.
- `packages/qwik` (`@elmethis/qwik`) is the **lead / base-reference** implementation
  for component behavior. It is ahead; `react` and `vue` are behind and are being
  brought up to parity with it.
- When refactoring tokens or components in `react`/`vue`, port **from** qwik and
  consume `@elmethis/core` tokens — match the existing token names rather than
  introducing new ones.

## Toolchain

- Use `pnpm` to manage dependencies and workspaces.
