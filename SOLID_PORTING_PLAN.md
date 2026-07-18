# Solid Component Parity and Maintenance

## Status

The initial React-to-Solid port was completed on July 19, 2026. This document
now records the compatibility contract, implementation sequence, and checks to
use when maintaining parity. The temporary porting note has been removed from
`AGENTS.md`.

## Objective

Port the public component surface in `packages/react` to `packages/solid` while preserving the
Elmethis design language, behavioral contracts, accessibility, and server-rendering support. React
is a behavioral reference, not source to translate mechanically. Solid implementations should use
fine-grained reactivity and Solid-native component patterns.

## Current State

- `@elmethis/react` exports 57 components across 12 component groups.
- `@elmethis/solid` exports all 57 components in the React component surface.
- React also exports hooks and utilities required by several components. Solid exposes the required
  behavior through framework-native `create*` primitives rather than React-compatible `use*` APIs.
- Solid has CSR, SSR, and real-browser Vitest layers in place. `ElmDivider` is the reference for
  source layout, native prop forwarding, reactive class updates, stories, and tests.

The authoritative public API inventories are:

- `packages/react/src/index.ts`
- `packages/solid/src/exports.ts`

## Compatibility Contract

Preserve these aspects unless a deliberate difference is documented:

- Component names and semantic custom prop names.
- Visual behavior and CSS custom-property contracts.
- DOM semantics, ARIA attributes, keyboard behavior, and focus management.
- Controlled and uncontrolled behavior, including falsy controlled values.
- Callback timing and values.
- CSR, SSR, and hydration behavior.
- Native attribute, data attribute, ARIA attribute, class, style, and ref forwarding.

Use framework-native behavior where React and Solid differ:

- Use Solid's `class`, JSX attribute types, DOM events, and ref conventions.
- Do not destructure reactive props at component entry. Use direct property access, `splitProps`,
  `mergeProps`, getters, or accessors.
- Use signals and memos for state and derivation. Effects are for synchronization with external
  systems, not copying derivable state.
- Use `onMount` and `onCleanup` for browser subscriptions, timers, observers, animation frames, and
  imperative integrations.
- Use `<For>` for identity-keyed collections and `<Index>` for position-keyed collections.
- Use `<Dynamic>` for dynamic native elements or components and `<Portal>` where content must leave
  its DOM parent. Account for portals producing no SSR output.
- Guard browser globals and browser-only libraries during SSR.

## Phase 0: Package Foundations

Complete these before scaling the number of components:

- [x] Create and maintain a parity checklist from `packages/react/src/index.ts`.
- [x] Port the shared text styles from `packages/react/src/styles/text.module.css`.
- [x] Port the component-private CSS variable registry from
      `packages/react/src/styles/_component-vars.css` and register it with Solid Stylelint.
- [x] Externalize declared production and peer dependencies consistently in the Solid build.
- [x] Add Solid-specific ESLint rules. `eslint-plugin-solid@0.14.5` runs with a narrowly scoped pnpm
      peer allowance for ESLint 10; upstream PR #207 verifies its rule suite on ESLint 10 and only
      widens package metadata.
- [x] Add package-consumer smoke tests for the `solid`, ESM, CJS, SSR, types, and CSS exports.
- [x] Add a Solid CI workflow that builds core first and runs checks, tests, coverage, the package
      build, and the Storybook build.
- [x] Bring the Solid Storybook theme controls and shared presentation in line with the established
      framework Storybooks where useful.

## Phase 1: Presentational Foundations

Port low-state, highly reused components first.

Typography:

- [x] `ElmBlockQuote`
- [x] `ElmCallout`
- [x] `ElmDivider`
- [x] `ElmFragmentIdentifier`
- [x] `ElmHeading`
- [x] `ElmInlineText`
- [x] `ElmList`
- [x] `ElmParagraph`

Fallback and Notion:

- [x] `ElmBlockFallback`
- [x] `ElmRectangleWave`
- [x] `ElmUnsupportedBlock`
- [x] `ElmNotionCallout`

Icons and visual samples:

- [x] `ElmDotLoadingIcon`
- [x] `ElmSquareLoadingIcon`
- [x] `ElmInlineIcon`
- [x] `ElmMdiIcon`
- [x] `ElmLanguageIcon`
- [x] `ElmColorPrimitiveSample`
- [x] `ElmColorSemanticSample`
- [x] `ElmValidation`

## Phase 2: Solid Utilities

Implement the reusable Solid foundations needed by interactive components:

- [x] Controlled/uncontrolled signal helper with updater callback support.
- [x] No generic controlled/uncontrolled store helper is required. Controlled structural snapshots
      use `createControllableSignal<T>`; internal fine-grained structures use Solid stores. Revisit
      only when a concrete parent-owned path-update contract exists.
- [x] Clipboard integration.
- [x] Theme parsing, observation, and `THEME_CHANGE_EVENT` support.
- [x] Local and session storage synchronization with SSR-safe initialization.
- [x] Delay, debounce, throttle, queue, and async-state primitives.
- [x] Framework-neutral Auto Animate integration.

Preserve public hook names only when public cross-framework parity requires them. Internal helpers
should use Solid-appropriate APIs and naming rather than reproducing React hook mechanics.

Solid exposes these primitives with `create*` names and accessor-based return values. It does not
provide React-style `use*` aliases or duplicate scalar utilities with store-specific variants.

## Phase 3: Simple Interaction

Port components with localized state or browser behavior:

- [x] `ElmButton`
- [x] `ElmCheckbox`
- [x] `ElmSwitch`
- [x] `ElmCollapse`
- [x] `ElmParallax`
- [x] `ElmCopyIcon`
- [x] `ElmToggleTheme`
- [x] `ElmBookmark`
- [x] `ElmBreadcrumb`
- [x] `ElmPageTop`
- [x] `ElmFile`
- [x] `ElmKatex`

## Phase 4: Composition and Context

Port each dependency cluster as one behavioral unit.

Tabs and toggles:

- [x] `ElmTabs`
- [x] `ElmTabList`
- [x] `ElmTab`
- [x] `ElmTabPanel`
- [x] `ElmToggle`

Overlay and disclosure behavior:

- [x] `ElmModal`
- [x] Solid modal helper/API
- [x] `ElmTooltip`
- [x] `ElmBlockImage`

Tables:

- [x] `ElmTable`
- [x] `ElmTableBody`
- [x] `ElmTableCell`
- [x] `ElmTableHeader`
- [x] `ElmTableRow`
- [x] Solid table contexts and public context types where compatibility requires them

Selection controls:

- [x] `ElmSelect`
- [x] `ElmButtonDropdown`

## Phase 5: Code and Rich Content

Follow dependency order so higher-level renderers use completed leaf components:

- [x] `ElmShikiHighlighter`
- [x] `ElmCodeBlock`
- [x] `ElmMarkdown`

`ElmMarkdown` comes after tables, modal/image behavior, code rendering, typography, and navigation
are available. Replace React memoization and recursive rendering assumptions with Solid memos,
reactive accessors, and identity-aware list rendering.

## Phase 6: Browser-Heavy Components

These require focused Chromium tests and explicit lifecycle cleanup:

- [x] `ElmTextField`
- [x] `ElmTextArea`
- [x] `ElmSlider`
- [x] `ElmAudioPlayer`
- [x] `ElmHtml`
- [x] `ElmHtmlViewer`
- [x] `useWordle` and its rendered component

Preserve the existing security and platform contracts, especially iframe sandbox normalization,
protected attribute ordering, Blob URL revocation, popup behavior, pointer capture, media event
synchronization, ResizeObserver cleanup, keyboard interaction, and native value/event semantics.

## Phase 7: A2UI

Port A2UI last because its catalog depends on most of the component library and the current renderer
uses React-specific bindings.

- [x] Preserve the existing v0.9 wire protocol and use `@a2ui/web_core@^0.10.5` through its
      framework-neutral `/v0_9` APIs. Do not combine the Solid port with a v1.0 protocol migration.
- [x] Align direct `@a2ui/web_core` dependencies on `^0.10.5` and update the official React adapter
      to `@a2ui/react@^0.10.2`; all framework implementations continue using `/v0_9` APIs. A
      scoped pnpm allowance covers the adapter's stale `@a2ui/markdown-it@0.0.3` peer declaration,
      and React peers are aligned to the adapter's `^19.2.7` requirement.
- [x] Reuse the framework-neutral `MessageProcessor`, surface model, data model, and catalog schemas.
- [x] Implement a Solid renderer/binder rather than depending on `@a2ui/react`.
- [x] Port the Notion block component registrations and functions.
- [x] Port JSONL streaming, incremental message handling, cancellation, subscriptions, surface
      creation, and surface cleanup.
- [x] Port `ElmA2ui` and its public catalog exports.
- [x] Verify catalog negotiation, unsupported-component degradation, action dispatch, data binding,
      and lifecycle cleanup in unit and browser tests.

Do not combine an A2UI protocol migration with the framework port unless explicitly planned. First
preserve the existing wire behavior or establish a separate migration plan.

## Parity Workflow

Use this workflow for every component or tightly coupled component cluster:

1. Read the React implementation, CSS, stories, tests, and relevant git history.
2. Identify the actual feature-leading implementation when React is not the original source.
3. Write down the public behavior and framework-specific differences before editing.
4. Port or reuse CSS without changing visual behavior unintentionally.
5. Implement the smallest idiomatic Solid component that satisfies the contract.
6. Add the public component and types to `packages/solid/src/exports.ts`.
7. Port the Storybook story and applicable CSR, SSR, and browser tests.
8. Run the package checks before committing the vertical slice.

Prefer one component or one dependency cluster per commit. Do not land a large implementation-only
batch followed by tests later.

## Test Strategy

CSR tests (`*.spec.tsx`) cover:

- Native prop and ref forwarding.
- Class and style merging.
- Reactive prop updates.
- Controlled and uncontrolled behavior.
- Synchronous user interaction that does not require layout or platform APIs.

SSR tests (`*.ssr.spec.tsx`) cover:

- Server JSX compilation and rendering.
- Expected initial markup.
- Absence of browser-global access.
- Safe fallback states for client-only features.

Browser tests (`*.browser.spec.tsx`) cover only behavior requiring Chromium:

- Computed styles and layout.
- Native dialog, iframe, media, clipboard, storage, pointer, selection, and focus behavior.
- ResizeObserver, BroadcastChannel, Blob URLs, popup, download, and postMessage behavior.
- Security-sensitive attribute and sandbox behavior.

Run these checks for each completed cluster:

```sh
pnpm --filter @elmethis/core run build
pnpm --filter @elmethis/solid run check.ci
pnpm --filter @elmethis/solid run test
pnpm --filter @elmethis/solid run test.coverage
pnpm --filter @elmethis/solid run test.coverage.browser
pnpm --filter @elmethis/solid run build
pnpm --filter @elmethis/solid run build-storybook
```

## Completion Criteria

The port is complete when:

- [x] Every intended React component export has a Solid counterpart or a documented exclusion.
- [x] Required public types, contexts, catalog values, and component-supporting utilities are
      exported.
- [x] Intentional framework API differences are documented in `packages/solid/README.md`.
- [x] CSR, SSR, browser, coverage, typecheck, package build, and Storybook build pass in the final
      local CI-equivalent matrix.
- [x] Package-condition smoke tests pass for client and server consumers.
- [x] The Solid Storybook is included with the other framework Storybooks in the GitHub Pages
      deployment workflow and site index.
- [x] The temporary note in `AGENTS.md` is removed and this plan is retained as permanent parity
      maintenance documentation.
