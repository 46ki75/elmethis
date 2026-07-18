# elmethis

Elmethis is a multi-framework component library and design system. The
framework-neutral `@elmethis/core` package supplies shared schemas, design
tokens, A2UI catalogs, and language metadata to Qwik, React, Solid, and Vue
implementations.

| Package           | Purpose                                          |
| ----------------- | ------------------------------------------------ |
| `@elmethis/core`  | Shared tokens, schemas, catalogs, and registries |
| `@elmethis/qwik`  | Qwik 2 components and hooks                      |
| `@elmethis/react` | React 19 components and hooks                    |
| `@elmethis/solid` | SolidJS components and reactive primitives       |
| `@elmethis/vue`   | Vue 3 components authored in TSX                 |

Build core before a framework package because the libraries consume its built
output and emitted `tokens.css`:

```sh
pnpm install
pnpm --filter @elmethis/core run build
pnpm --filter @elmethis/solid run check.ci
```

See `AGENTS.md` for repository commands and architecture, and `TESTING.md` for
the CSR, SSR, and browser test layers.

## Development Ports

- `packages/copilotkit/`: `19101` (also serves the stub Weather MCP server at `/mcp`)
- `packages/qwik/`: `19211`
- `packages/react/`: `19221`
- `packages/solid/`: `19241`
- `packages/vue/`: `19231`
