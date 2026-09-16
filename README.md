# elmethis

Elmethis is a multi-framework component library and design system. The
framework-neutral `@elmethis/core` package supplies shared schemas, design
tokens, generated DESIGN.md guides, A2UI catalogs, and language metadata to React, Solid, and Vue
implementations.

| Package             | Purpose                                                        |
| ------------------- | -------------------------------------------------------------- |
| `@elmethis/core`    | Shared tokens, DESIGN.md guides, schemas, catalogs, registries |
| `@elmethis/draw.io` | diagrams.net configuration generated from tokens               |
| `@elmethis/react`   | React 19 components and hooks                                  |
| `@elmethis/solid`   | SolidJS components and reactive primitives                     |
| `@elmethis/vue`     | Vue 3 components authored in TSX                               |

## Setup and tasks

Install [mise](https://mise.jdx.dev/installing-mise.html) 2026.9.9 or newer, then:

```sh
mise trust mise.toml
mise install node pnpm
mise run setup
mise run drawio:build
mise run solid:browser:install
mise run solid:ci
```

`mise.toml` pins Node exactly; `package.json#packageManager` pins pnpm exactly.
Commit `mise.lock` and its `.mise/locks/` sidecars when updating tools. The lock
covers macOS arm64 and Linux x64/arm64. CI and devcontainers use these same pins.

Run `mise tasks ls` to discover commands. `mise run check` runs the workspace
checks; `mise run test` runs unit/SSR tests. Browser tests and their explicit
installation are separate tasks. `mise run pages:build` assembles the Pages site.
Component tasks build core and the AG-UI stub first when required.

`mise run fmt` and `mise run fmt-check` use the same tracked JS/TS/JSON scope;
pass repeated `--file <repo-relative-path>` arguments for a selection. Package
checks also apply their existing package-specific formatting policies.
Tasks work from the root or a subdirectory without shell activation. Make mise
available on PATH for editor and Git hooks too.

See `AGENTS.md` for repository commands and architecture, and `TESTING.md` for
the CSR, SSR, and browser test layers. The shared
[mise standard](https://github.com/46ki75/engineering-standard/blob/main/skills/engineering-standard/references/mise/README.md)
describes tool ownership and task conventions.

## Development Ports

- `packages/copilotkit/`: `19101` (also serves the stub Weather MCP server at `/mcp`)
- `packages/react/`: `19221`
- `packages/solid/`: `19241`
- `packages/vue/`: `19231`
