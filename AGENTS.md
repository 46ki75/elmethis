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

- `packages/qwik` (`@elmethis/qwik`) is the **lead / base-reference** implementation
  for both the design-token system and component behavior. It is ahead; `react`
  and `vue` are behind and are being brought up to parity with it.
- The canonical design tokens live in `packages/qwik/src/styles/global.css`
  (two layers: primitive `--elmethis-primitive-*` and semantic `--elmethis-*`,
  themed via the `[data-theme="dark"]` attribute).
- When refactoring tokens or components in `react`/`vue`, port **from** qwik —
  match qwik's token names and usage rather than introducing new ones.

## Toolchain

- Use `pnpm` to manage dependencies and workspaces.
