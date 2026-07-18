# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# elmethis

A multi-framework component library / design system ("Elmethis Theme"), published to npm as
`@elmethis/*`. One framework-agnostic core feeds Qwik, React, Solid, and Vue implementations. The
Qwik, React, and Vue libraries are each shipped as a Storybook to GitHub Pages.

## Packages

| Package                | Path                   | Published     | Purpose                                                                                                                                            |
| ---------------------- | ---------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@elmethis/core`       | `packages/core`        | yes           | Framework-agnostic hub: shared Zod schemas/types, design tokens, A2UI catalogs, language icons. Every framework lib depends on it (`workspace:^`). |
| `@elmethis/qwik`       | `packages/qwik`        | yes           | Qwik 2 implementation. Components + hooks. Storybook :19211                                                                                        |
| `@elmethis/react`      | `packages/react`       | yes           | React 19 implementation; same component surface as qwik/vue. Storybook :19221                                                                      |
| `@elmethis/solid`      | `packages/solid`       | yes           | SolidJS implementation. Components are added as they are ported. Storybook :19241                                                                  |
| `@elmethis/vue`        | `packages/vue`         | yes           | Vue 3 implementation (authored in TSX); same component surface as qwik/react. Storybook :19231                                                     |
| `ikuma-theme`          | `packages/ikuma-theme` | VS Code / npm | VS Code dark/light extension; generates the published `@46ki75/ikuma-theme` Shiki package and Windows Terminal scheme                              |
| `@elmethis/ag-ui-stub` | `packages/ag-ui-stub`  | no (private)  | Deterministic, LLM-free AG-UI test-double server (Hono :19103)                                                                                     |
| `backend` (copilotkit) | `packages/copilotkit`  | no            | CopilotKit backend on the Claude Agent SDK (Hono :19101; also serves a stub Weather MCP at `/mcp`)                                                 |

`packages/mcp-server` and the root Cargo workspace (`crates/*`) are empty placeholders for a planned
Rust MCP server — no code yet.

## Commands

Package manager is **pnpm** (`pnpm@9.12.3`); Node 22. Run scripts per-package with `--filter`, or
`cd` into the package. **Build `@elmethis/core` before qwik/react/solid/vue** — they import its built
output and emitted `tokens.css`.

| Command                                          | Description                                                                |
| ------------------------------------------------ | -------------------------------------------------------------------------- |
| `pnpm install`                                   | Install all workspace deps                                                 |
| `pnpm --filter @elmethis/core run build`         | Build core (tsdown + tokens.css + catalog JSON) — do this first            |
| `pnpm --filter ikuma-theme run build`            | Build VS Code, Shiki, Windows Terminal, and VSIX artifacts                 |
| `pnpm --filter ikuma-theme run check`            | Format-check, type-check, and build all theme artifacts                    |
| `pnpm --filter @elmethis/qwik run dev`           | Storybook dev server (qwik :19211, react :19221, solid :19241, vue :19231) |
| `pnpm --filter @elmethis/<pkg> run check`        | fmt.check + lint + (css lint) + build.types                                |
| `pnpm --filter @elmethis/<pkg> run test.unit`    | Unit + SSR layer (node / createDOM)                                        |
| `pnpm --filter @elmethis/<pkg> run test.browser` | Browser layer (real Chromium via Playwright)                               |
| `pnpm run --recursive check`                     | Lefthook pre-commit check across all packages                              |

Run a single test (from inside the package, or via `--filter @elmethis/<pkg> exec`):

- unit: `pnpm exec vitest run src/path/foo.spec.tsx` (add `-t "name"` to filter by title)
- browser: `pnpm exec vitest run --config vitest.browser.config.ts src/path/foo.browser.spec.tsx`

Git hooks run via **lefthook** (`lefthook.yml`): `fmt` runs prettier once at the repo root; `check`
runs eslint / stylelint / vitest-related per package.

## Architecture

- **core is the single source of truth.** Design tokens (`src/style/token.ts` → emitted
  `tokens.css`), A2UI Notion block catalogs, JSON schemas, and language-icon registries live here and
  are consumed by all four framework libs — defined once, mirrored everywhere.
- **Component leadership is per-feature, not fixed to one framework.** The mature implementations
  keep the same component surface (same names, same props) per framework idiom, but which framework
  originates a given component varies — qwik led the original recreation-wave surface, while several
  recent components (`ElmButtonDropdown`, `ElmHtml`, `ElmSlider`) landed in react first and were
  ported to qwik/vue afterward. Check `git log` for a component before assuming which framework is
  its source of truth.
- **Three Storybooks → one GitHub Pages site.** `pages-deploy.yml` builds core, then each Storybook,
  and assembles them under `/qwik`, `/react`, `/vue` (plus the A2UI catalog JSON). Deploys on push
  to `main`.
- **Ikuma Theme has two distribution targets.** Its unscoped package manifest is the VS Code
  extension (`46ki75.ikuma-theme`); `scripts/build-npm.ts` emits the separately published scoped
  Shiki package (`@46ki75/ikuma-theme`) under `dist/npm`. The framework libraries currently consume
  the published Shiki package.
- **Per-package CI.** Established component library workflows (`.github/workflows/<pkg>.yml`) run
  lint, format-check, build, Storybook, and test jobs after building core. `ikuma-theme.yml` runs its
  package `check`, including generation and VSIX packaging.

## Gotchas

- Build `@elmethis/core` before working on qwik/react/solid/vue, or their imports and `tokens.css` resolve
  to stale/missing output.
- Theme outputs are generated under `packages/ikuma-theme/dist` and ignored by Git. Build the theme
  before publishing its VS Code extension or `@46ki75/ikuma-theme` package.
- Tests split into two layers by file suffix (`*.spec.tsx` unit vs `*.browser.spec.tsx` Chromium)
  with **separate Vitest configs** — see `TESTING.md`.
