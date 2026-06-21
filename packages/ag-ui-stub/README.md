# @elmethis/ag-ui-stub

A deterministic, **LLM-free** AG-UI test double. It speaks the same wire
contract as a real agent backend (POST `RunAgentInput` → SSE stream of
`BaseEvent`s) but replays canned, scripted scenarios — so Storybook, unit tests,
and `*.browser.spec.tsx` can exercise every branch of the `@elmethis`
ag-ui-client components without an API key, network, cost, or flakiness.

> `@ag-ui/*` is pinned to **0.0.57** to match `@ag-ui/client` in
> `@elmethis/qwik`, so encoded event shapes line up with what the components
> expect. (The `copilotkit` backend tracks the separate `@ag-ui/mastra` 1.x
> line.)

## Two layers

### 1. `agUiResponse` — the framework-agnostic primitive

```ts
import { agUiResponse, scenarios } from "@elmethis/ag-ui-stub";

const response = agUiResponse(scenarios["tool-call"], runAgentInput);
// → Web-standard Response, body is the AG-UI SSE stream
```

Runs anywhere (Hono, Node, workerd) — and with **no server at all** in tests.
`HttpAgent` accepts an injected `fetch`, so:

```ts
import { HttpAgent } from "@ag-ui/client";
import { createStubFetch } from "@elmethis/ag-ui-stub";

const agent = new HttpAgent({
  url: "http://stub/agent/tool-call/run",
  fetch: createStubFetch(), // scenario picked from the URL path
});
```

### 2. The Hono server — for Storybook & manual dev

```sh
pnpm --filter @elmethis/ag-ui-stub serve   # PORT=19103
# POST http://localhost:19103/stub/agent/<scenario>/run  (optional ?delay=<ms>)
```

Point a Storybook story's `url` at it instead of the live backend.

## Scenarios

`full` (a complete reason → act → state → answer run, with `STEP_*`
delimiters), `text-stream`, `tool-call`, `state`, `reasoning`, `interrupt`
(HITL, honors `resume`), `messages-snapshot`, `error`, `long-stream`. The
single-feature ones each map to a renderer branch a real LLM rarely triggers on
demand; `full` drives them all at once in one realistic stream.

`chunkDelayMs` (or the server's `?delay=`) paces chunks for streaming UI; it
defaults to `0` so tests run at full speed.
