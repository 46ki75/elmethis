# @elmethis/solid

SolidJS component library for Elmethis. It implements the 57-component surface
shared with `@elmethis/react` plus seven AG-UI components, using Solid-native
reactivity, ownership, and DOM conventions.

Components live under `src/components` and the public inventory is maintained in
`src/exports.ts`. Design tokens and shared schemas come from `@elmethis/core`.

```tsx
import { ElmDivider } from "@elmethis/solid";
import "@elmethis/solid/style.css";

<ElmDivider />;
```

## Framework Differences

- Solid reactive utilities use `create*` names and return accessors rather than
  reproducing React hook shapes.
- Public table context values are accessors. Call the context value to read the
  current section or row-header state.
- `ElmCopyIcon` forwards native button attributes in addition to its shared
  semantic props.
- `ElmA2ui` accepts a paired `catalog` rather than React's `components` array.

## A2UI

`ElmA2ui` preserves the existing A2UI v0.9 wire protocol and uses the
framework-neutral `@a2ui/web_core/v0_9` processor. It does not depend on the
React adapter. Pre-collected messages take precedence over a JSONL `url`.

```tsx
import { ElmA2ui, defineRenderer, notionBlockCatalog } from "@elmethis/solid";
import { RichTextApi } from "@elmethis/core";

const catalog = notionBlockCatalog.extend(
  defineRenderer(RichTextApi, ({ props }) => <mark>{props.text}</mark>),
);

<ElmA2ui messages={messages} catalog={catalog} />;
```

`notionBlockCatalog` is the default and includes the Elmethis Notion block
renderers. `basicCatalog` provides only the official basic component set.
`CatalogRenderer.extend()` is immutable; component and function definitions
from later catalogs replace definitions with the same name while preserving
the rest of the base catalog.

The low-level `A2uiSurface`, `ComponentHost`, contexts, `CatalogRenderer`,
`defineRenderer`, and renderer argument types are public for custom hosts and
catalogs. Most consumers only need `ElmA2ui` and one of the provided catalogs.

## AG-UI

`useAgent` owns an AG-UI `AbstractAgent`, streamed message state, frontend
tools, interrupts, retries, and queued user messages. Pass `url` to use the
default `HttpAgent`, or provide an `agentFactory` for another adapter or an
in-process agent. Its callbacks are Solid-native functions rather than Qwik
QRLs:

```tsx
import { ElmAgUiAgent, useAgent } from "@elmethis/solid";

const agent = useAgent({ url: "/api/agent" });

const inProcessAgent = useAgent({
  agentFactory: () => createCustomAgent(),
});

<ElmAgUiAgent
  state={agent.state}
  send={agent.send}
  retry={agent.retry}
  abort={agent.abort}
  dequeue={agent.dequeue}
/>;
```

`useMcpTools` and `useMcpPrompts` open browser-side Streamable HTTP sessions
under the current Solid owner and close them on disposal. Their `tools` and
`prompts` values are accessors.

The MCP SDK currently pulls in `pkce-challenge`, whose package exports can fail
resolution in some Vite consumer builds. If that occurs and the application
does not use MCP OAuth, alias `pkce-challenge` to a local throwing stub. Do not
stub it when OAuth is required.

## Controllable State

`createControllableSignal` provides Solid-native controlled and uncontrolled
state with value and updater setters:

```tsx
import { createControllableSignal } from "@elmethis/solid";

const [value, setValue] = createControllableSignal({
  value: () => props.value,
  defaultValue: () => props.defaultValue ?? false,
  onChange: (next) => props.onValueChange?.(next),
});
```

Only `undefined` selects uncontrolled mode. Controlled writes notify
`onChange`; uncontrolled writes update internal state and notify `onChange`.

## Reactive Primitives

Solid-native utilities use `create*` names and expose accessors instead of
copying React hook return shapes:

- `createClipboard`
- `createElmethisTheme` and `THEME_CHANGE_EVENT`
- `createLocalStorage` and `createSessionStorage`
- `createDelayedSignal`, `createDebounced`, and `createThrottled`
- `ThrottledQueue` and `createThrottledQueue`
- `createAsyncState`
- `createAutoAnimate`
- `createModal`

Supporting option, controller, and return types are exported with each public
primitive.

Browser integrations initialize under a Solid owner and clean up timers,
listeners, observers, channels, and controllers when that owner is disposed.

## Scripts

| Script              | Purpose                                       |
| ------------------- | --------------------------------------------- |
| `pnpm build`        | Build ESM/CJS, preserved Solid JSX, and types |
| `pnpm dev`          | Start Storybook on port 19241                 |
| `pnpm dev.lib`      | Rebuild the library in watch mode             |
| `pnpm check`        | Run formatting, lint, and type checks         |
| `pnpm fmt`          | Format source files                           |
| `pnpm lint`         | Lint source files                             |
| `pnpm test.unit`    | Run happy-dom component tests and SSR tests   |
| `pnpm test.browser` | Run real Chromium component tests             |

## Testing

- `*.spec.tsx` uses `@solidjs/testing-library` in `happy-dom` for component
  behavior and reactive updates.
- `*.ssr.spec.tsx` uses Solid's server JSX transform and `renderToString`.
- `*.browser.spec.tsx` is reserved for computed styles, layout, native browser
  behavior, and real Web APIs.

Always pass a function to the Solid renderer: `render(() => <Component />)`.
See the repository-level `TESTING.md` for the shared conventions.

The `solid` package export preserves JSX so Solid-aware consumers can compile
components for their own client or SSR target. `solid-js` is a peer dependency
to ensure the library and consuming application share one reactive runtime.
