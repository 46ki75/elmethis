# elmethis

## Workspace Overview

- The root is a pnpm workspace with packages under `packages/*`.
- Contains UI component libraries for `vue`, `react`, and `qwik`.

## Directory Structure

- `packages/core`: (`@elmethis/core`) a common framework agnostic package which is used by each SPA component library.
- `packages/vue`: (`@elmethis/vue`) Vue 3 component library and Storybook package.
- `packages/react`: (`@elmethis/react`) React component library.
- `packages/qwik`: (`@elmethis/qwik`) Qwik component library.

## Toolchain

- Use `pnpm` to manage dependencies and workspaces.
