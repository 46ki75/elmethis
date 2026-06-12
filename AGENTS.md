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

## CSS Class Naming Convention

Authored against `packages/qwik` (the lead implementation); `react`/`vue` follow it.
All component styles use CSS Modules (`*.module.css`, `import styles from "./x.module.css"`),
so scoping is automatic — names never need a global-collision guard.

- **Casing:** lowercase `kebab-case` for every class (`message-content-wrapper`,
  `clickable-icon`).
- **Root/host element:** name it after the component — `.elm-modal`, `.elm-callout`,
  `.elm-button`. Not a generic `.wrapper` / `.container` / `.root`.
- **State & variant modifiers:** standalone classes combined in the `class` array and
  matched with `&.state` nesting under the root — `.shown`, `.active`, `.primary`. Not
  BEM `block--modifier`.
  ```css
  .elm-modal {
    &.shown {
      opacity: 1;
    }
  }
  /* TSX: class={[styles.elmModal, open && styles.shown]} */
  ```
- **Child elements:** short role names nested under the root — the root already carries
  the block identity and scoping handles collisions, so do **not** block-prefix them.
  ```css
  .elm-callout {
    .header { ... }
    .icon { ... }
  }
  ```
- **Block-prefix exception:** only when a component renders several top-level groups with
  no single root to nest under (e.g. `elm-ag-ui-message-renderer` → `.message-content-*`).
  There the prefix is the only thing carrying context. Treat nesting and prefixing as
  **mutually exclusive** — never stack `.elm-callout { .elm-callout-header {} }` (redundant
  and prone to name drift).

## Prop Naming Convention

Shared across `qwik`, `react`, and `vue`. Survives every framework: a prefixed
boolean reads as `isOpen` in Qwik/React and exposes as `is-open` in Vue templates.

- **Custom boolean state:** `is` / `has` prefix + PascalCase — `isOpen`, `isLoading`,
  `isRunning`, `hasError`. The prefix marks the value as a boolean flag at a glance
  (`error` could be a message; `hasError` cannot).
- **Native attribute passthrough:** when a prop is forwarded directly onto a native
  element, keep the native attribute's exact name — `disabled`, `required`, `readonly`,
  `checked`, `open` (on `<dialog>`/`<details>`). Do **not** rename to `isDisabled`.
  - Edge case: a prop is "native passthrough" only when it literally lands on the native
    attribute. A `Modal` that drives `.showModal()` owns its state, so it is `isOpen`,
    not bare `open`.
- **Non-boolean value props:** bare noun, no prefix — `label`, `color`, `size`,
  `selectedId`.
- **Change events:** name after the bare concept, not the prefixed prop — `isOpen`
  pairs with `onOpenChange$` / `onToggle$`, never `onIsOpenChange$`.

## Toolchain

- Use `pnpm` to manage dependencies and workspaces.
