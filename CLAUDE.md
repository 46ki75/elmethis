# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# elmethis

A multi-framework component library / design system ("Elmethis Theme"), published to npm as
`@elmethis/*`. One framework-agnostic core feeds three parallel component libraries (Qwik, React,
Vue), each shipped as a Storybook to GitHub Pages.

## Packages

| Package                | Path                  | Published    | Purpose                                                                                                                                            |
| ---------------------- | --------------------- | ------------ | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| `@elmethis/core`       | `packages/core`       | yes          | Framework-agnostic hub: shared Zod schemas/types, design tokens, A2UI catalogs, language icons. Every framework lib depends on it (`workspace:^`). |
| `@elmethis/qwik`       | `packages/qwik`       | yes          | **Lead** implementation (Qwik 2). Components + hooks. Storybook :19211                                                                             |
| `@elmethis/react`      | `packages/react`      | yes          | React 19 port; mirrors qwik. Storybook :19221                                                                                                      |
| `@elmethis/vue`        | `packages/vue`        | yes          | Vue 3 port (authored in TSX); mirrors qwik. Storybook :19231                                                                                       |
| `@elmethis/ag-ui-stub` | `packages/ag-ui-stub` | no (private) | Deterministic, LLM-free AG-UI test-double server (Hono :19103)                                                                                     |
| `backend` (copilotkit) | `packages/copilotkit` | no           | CopilotKit backend on the Claude Agent SDK (Hono :19101; also serves a stub Weather MCP at `/mcp`)                                                 |

`packages/mcp-server` and the root Cargo workspace (`crates/*`) are empty placeholders for a planned
Rust MCP server — no code yet.

## Commands

Package manager is **pnpm** (`pnpm@9.12.3`); Node 22. Run scripts per-package with `--filter`, or
`cd` into the package. **Build `@elmethis/core` before qwik/react/vue** — they import its built
output and emitted `tokens.css`.

| Command                                          | Description                                                     |
| ------------------------------------------------ | --------------------------------------------------------------- |
| `pnpm install`                                   | Install all workspace deps                                      |
| `pnpm --filter @elmethis/core run build`         | Build core (tsdown + tokens.css + catalog JSON) — do this first |
| `pnpm --filter @elmethis/qwik run dev`           | Storybook dev server (qwik :19211, react :19221, vue :19231)    |
| `pnpm --filter @elmethis/<pkg> run check`        | fmt.check + lint + (css lint) + build.types                     |
| `pnpm --filter @elmethis/<pkg> run test.unit`    | Unit + SSR layer (node / createDOM)                             |
| `pnpm --filter @elmethis/<pkg> run test.browser` | Browser layer (real Chromium via Playwright)                    |
| `pnpm run --recursive check`                     | Lefthook pre-commit check across all packages                   |

Run a single test (from inside the package, or via `--filter @elmethis/<pkg> exec`):

- unit: `pnpm exec vitest run src/path/foo.spec.tsx` (add `-t "name"` to filter by title)
- browser: `pnpm exec vitest run --config vitest.browser.config.ts src/path/foo.browser.spec.tsx`

Git hooks run via **lefthook** (`lefthook.yml`): `fmt` runs prettier once at the repo root; `check`
runs eslint / stylelint / vitest-related per package.

## Architecture

- **core is the single source of truth.** Design tokens (`src/style/token.ts` → emitted
  `tokens.css`), A2UI Notion block catalogs, JSON schemas, and language-icon registries live here and
  are consumed by all three framework libs — defined once, mirrored everywhere.
- **qwik leads; react and vue follow.** qwik is the reference implementation; react and vue recreate
  the same component surface (same names, same props) per framework idiom. When changing a
  component, qwik is usually the source of truth.
- **Three Storybooks → one GitHub Pages site.** `pages-deploy.yml` builds core, then each Storybook,
  and assembles them under `/qwik`, `/react`, `/vue` (plus the A2UI catalog JSON). Deploys on push
  to `main`.
- **Per-package CI.** Each lib has its own workflow (`.github/workflows/<pkg>.yml`) with
  lint / format-check / build / build-storybook / test-unit / test-browser jobs; all build core first.

## Gotchas

- Build `@elmethis/core` before working on qwik/react/vue, or their imports and `tokens.css` resolve
  to stale/missing output.
- Tests split into two layers by file suffix (`*.spec.tsx` unit vs `*.browser.spec.tsx` Chromium)
  with **separate Vitest configs** — see `TESTING.md`.
