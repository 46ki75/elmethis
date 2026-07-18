# @elmethis/solid

SolidJS component library for elmethis.

Components are ported into `src` and exported from `src/index.ts`. Design tokens
come from `@elmethis/core`.

```tsx
import { ElmDivider } from "@elmethis/solid";
import "@elmethis/solid/style.css";

<ElmDivider />;
```

## Scripts

| Script         | Purpose                                       |
| -------------- | --------------------------------------------- |
| `pnpm build`   | Build ESM/CJS, preserved Solid JSX, and types |
| `pnpm dev`     | Start Storybook on port 19241                 |
| `pnpm dev.lib` | Rebuild the library in watch mode             |
| `pnpm check`   | Run formatting, lint, and type checks         |
| `pnpm fmt`     | Format source files                           |
| `pnpm lint`    | Lint source files                             |

The `solid` package export preserves JSX so Solid-aware consumers can compile
components for their own client or SSR target. `solid-js` is a peer dependency
to ensure the library and consuming application share one reactive runtime.
