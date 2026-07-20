# @elmethis/ag-ui-stub

A deterministic, **LLM-free** AG-UI test agent. It extends `AbstractAgent` and
replays scripted scenarios in process, so Storybook, unit tests, and
`*.browser.spec.tsx` can exercise the `@elmethis` AG-UI clients without an HTTP
server, API key, network, cost, or flakiness.

> `@ag-ui/*` is pinned to **0.0.57** to match `@ag-ui/client` in
> `@elmethis/qwik` and `@elmethis/solid`, so event shapes line up with what the
> components expect. (The `copilotkit` backend tracks the separate
> `@ag-ui/mastra` 1.x line.)

## Usage

Pass a `StubAgent` through the frontend client's agent factory:

```ts
import { StubAgent } from "@elmethis/ag-ui-stub";

const agent = useAgent({
  agentFactory: () =>
    new StubAgent({ scenario: "tool-call", chunkDelayMs: 20 }),
});
```

`StubAgent` accepts either a built-in scenario name or a custom `Scenario`:

```ts
import { StubAgent, events, type Scenario } from "@elmethis/ag-ui-stub";

const custom: Scenario = async function* () {
  yield events.textStart("message-1");
  yield events.textContent("message-1", "Hello from a custom scenario.");
  yield events.textEnd("message-1");
};

const agent = new StubAgent({ scenario: custom });
```

The agent emits `BaseEvent`s directly. HTTP request serialization, SSE parsing,
and server routing belong to transport adapters such as `HttpAgent` and are not
part of this package.

## Scenarios

`full` (a complete reason → act → state → answer run, with `STEP_*`
delimiters), `text-stream`, `tool-call`, `state`, `reasoning`, `interrupt`
(HITL, honors `resume`), `messages-snapshot`, `error`, `long-stream`. The
single-feature ones each map to a renderer branch a real LLM rarely triggers on
demand; `full` drives them all at once in one realistic stream.

`chunkDelayMs` paces chunks for streaming UI and defaults to `0` so tests run at
full speed. Calling `abortRun()` cancels an active delay and stops scenario
iteration.
