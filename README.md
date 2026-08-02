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

Build core before packages that consume it. The build emits its compiled modules,
`tokens.css`, catalogs, and generated design guides:

```sh
pnpm install
pnpm --filter @elmethis/core run build
pnpm --filter @elmethis/draw.io run build
pnpm --filter @elmethis/solid run check.ci
```

See `AGENTS.md` for repository commands and architecture, and `TESTING.md` for
the CSR, SSR, and browser test layers.

## Development Ports

- `packages/copilotkit/`: `19101` (also serves the stub Weather MCP server at `/mcp`)
- `packages/react/`: `19221`
- `packages/solid/`: `19241`
- `packages/vue/`: `19231`
