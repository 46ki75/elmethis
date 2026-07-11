# TypeScript / JavaScript SDK

Source: `submodules/ag-ui/docs/sdk/js/**`

The first-party TypeScript packages: `@ag-ui/core`, `@ag-ui/client`,
`@ag-ui/encoder`, `@ag-ui/proto`. Open this file for `AbstractAgent`,
`HttpAgent`, middleware, and `AgentSubscriber` APIs.

## Packages

| Package | Purpose | Install |
| --- | --- | --- |
| `@ag-ui/core` | Types and event definitions, `BaseEvent`, `EventType`, `RunAgentInput`, `Message`, `Tool`, `Context`, `State` | `npm install @ag-ui/core` |
| `@ag-ui/client` | Client runtime: `AbstractAgent`, `HttpAgent`, middleware, `AgentSubscriber`, RxJS event streams | `npm install @ag-ui/client` |
| `@ag-ui/encoder` | Event encoding (SSE and binary) | `npm install @ag-ui/encoder` |
| `@ag-ui/proto` | Protobuf definitions for the binary transport | `npm install @ag-ui/proto` |

## `@ag-ui/core`

Pure type/data package. Use it on both client and server (or middleware) to
share type definitions for events, messages, tools, context, and state.

```typescript
import { EventType, type BaseEvent, type RunAgentInput, type Message, type Tool } from "@ag-ui/core"
```

See `concepts/events.md` for the full event type reference and
`concepts/messages.md` for message types.

## `@ag-ui/client` — `AbstractAgent`

The base class for any client-side agent.

```typescript
import { AbstractAgent } from "@ag-ui/client"
```

### Configuration

```typescript
interface AgentConfig {
  agentId?: string         // unique agent id
  description?: string     // human-readable; also used by the LLM
  threadId?: string        // conversation thread id
  initialMessages?: Message[]
  initialState?: State
}
```

Extend the interface in a subclass to add custom options:

```typescript
interface MyAgentConfig extends AgentConfig { myOption: string }

class MyAgent extends AbstractAgent {
  private myOption: string
  constructor(config: MyAgentConfig) {
    super(config)
    this.myOption = config.myOption
  }
}
```

### Core methods

#### `runAgent(parameters?, subscriber?): Promise<RunAgentResult>`

```typescript
interface RunAgentParameters {
  runId?: string
  tools?: Tool[]
  context?: Context[]
  forwardedProps?: Record<string, any>
}

interface RunAgentResult {
  result: any
  newMessages: Message[]
}
```

The optional `subscriber` receives events for this specific run.

#### `subscribe(subscriber: AgentSubscriber): { unsubscribe(): void }`

Adds a subscriber that handles events across multiple runs. Returns an
unsubscribe function.

#### `use(...middlewares): this`

Adds middleware to the agent's event-processing pipeline. Accepts both
function- and class-based middleware.

```typescript
agent.use((input, next) => { /* function middleware */ return next.run(input) })
agent.use(new FilterToolCallsMiddleware({ allowedToolCalls: ["search"] }))
agent.use(loggingMiddleware, authMiddleware, filterMiddleware)
```

Middleware executes in the order added; each wraps the next. Applied in
`runAgent()`; **not** in `connectAgent()` (which calls `connect()` directly).
See `concepts/middleware.md`.

#### `getCapabilities?(): Promise<AgentCapabilities>`

Optional. Returns `undefined` when not implemented. See
`concepts/capabilities.md`.

#### `abortRun(): void`

Cancels the current execution.

#### `clone(): AbstractAgent`

Deep-copies the agent instance.

#### `connectAgent(parameters?, subscriber?): Promise<RunAgentResult>`

Long-lived connection variant. Requires `connect()` to be implemented in the
subclass. Default implementation throws `ConnectNotImplementedError`.

### Observable properties

```typescript
events$: Observable<BaseEvent>
```

RxJS `ReplaySubject` of all events emitted during execution — late subscribers
replay history. Switch on `event.type` for the typed event stream:

```typescript
agent.events$.subscribe((event) => {
  if (event.type === EventType.TEXT_MESSAGE_CONTENT) appendToUi(event.delta)
})
```

### Properties

| Property | Type |
| --- | --- |
| `agentId` | `string` |
| `description` | `string` |
| `threadId` | `string` |
| `messages` | `Message[]` |
| `state` | `any` |
| `events$` | `Observable<BaseEvent>` |

### Protected hooks (override in subclasses)

| Method | Purpose |
| --- | --- |
| `run(input)` | **Abstract** — emit events for the run |
| `connect(input)` | Override for persistent connections |
| `apply(input)` | Process events and update state |
| `prepareRunAgentInput(parameters?)` | Build `RunAgentInput` |
| `onError(error)` | Error hook |
| `onFinalize()` | Cleanup hook |

## `@ag-ui/client` — `HttpAgent`

Concrete subclass that talks to an AG-UI HTTP endpoint.

```typescript
import { HttpAgent } from "@ag-ui/client"

interface HttpAgentConfig extends AgentConfig {
  url: string
  headers?: Record<string, string>
}

const agent = new HttpAgent({
  url: "https://api.example.com/v1/agent",
  headers: { Authorization: "Bearer token" },
})
```

### Default request shape

```typescript
{
  method: "POST",
  headers: {
    ...this.headers,
    "Content-Type": "application/json",
    Accept: "text/event-stream",
  },
  body: JSON.stringify(input),
  signal: this.abortController.signal,
}
```

Override `requestInit(input)` to customize.

### Properties

| Property | Notes |
| --- | --- |
| `url` | Endpoint |
| `headers` | Default headers |
| `abortController` | `AbortController` used by `abortRun()` |

## Middleware

See `concepts/middleware.md` for the full picture. Two flavors:

```typescript
import { MiddlewareFunction, Middleware } from "@ag-ui/client"

// Function
const logger: MiddlewareFunction = (input, next) => next.run(input).pipe(tap(console.log))

// Class
class MetricsMiddleware extends Middleware {
  run(input: RunAgentInput, next: AbstractAgent): Observable<BaseEvent> {
    return this.runNext(input, next).pipe(/* ... */)
  }
}

agent.use(logger, new MetricsMiddleware())
```

Inside class middleware:

- `runNext(input, next)` — normalizes chunk events into the canonical
  Start/Content/End triads.
- `runNextWithState(input, next)` — also gives you accumulated messages and
  state after each event.

### Built-in: `FilterToolCallsMiddleware`

```typescript
import { FilterToolCallsMiddleware } from "@ag-ui/client"

agent.use(new FilterToolCallsMiddleware({ allowedToolCalls: ["search", "calculate"] }))
// or
agent.use(new FilterToolCallsMiddleware({ disallowedToolCalls: ["delete", "modify"] }))
```

Filters emitted `TOOL_CALL_*` events. Does not block tool execution upstream —
those still happen on the backend.

## `AgentSubscriber`

Event-driven subscriber for handling lifecycle events and state mutations.
Pass to `runAgent(params, subscriber)` for per-run handlers, or use
`agent.subscribe(subscriber)` for cross-run handlers.

```typescript
await agent.runAgent({}, {
  onRunStartedEvent({ event })          { /* ... */ },
  onTextMessageStartEvent({ event })    { /* ... */ },
  onTextMessageContentEvent({ event })  { /* event.delta */ },
  onTextMessageEndEvent({ event })      { /* ... */ },
  onToolCallStartEvent({ event })       { /* event.toolCallName */ },
  onToolCallArgsEvent({ event })        { /* event.delta */ },
  onToolCallEndEvent({ event })         { /* ... */ },
  onToolCallResultEvent({ event })      { /* event.content */ },
  onStateSnapshotEvent({ event })       { /* event.snapshot */ },
  onStateDeltaEvent({ event })          { /* event.delta — JSON Patch */ },
  onReasoningStartEvent({ event })      { /* ... */ },
  onRunFinishedEvent({ event })         { /* event.outcome */ },
  onRunErrorEvent({ event })            { /* event.message */ },
})
```

Subscriber methods cover the full event taxonomy with `on{EventName}Event`
naming.

## `@ag-ui/encoder` and `@ag-ui/proto`

- `@ag-ui/encoder` — encodes/decodes events to SSE or binary frames.
  Typically only needed when building a custom transport or instrumenting
  the wire format.
- `@ag-ui/proto` — protobuf schema for the binary transport. Used by the
  encoder; rarely imported directly.

## Quickstart commands

```bash
# Scaffold an end-to-end app
npx create-ag-ui-app@latest

# Or install packages manually
npm install @ag-ui/client @ag-ui/core
```

## See also

- `concepts/agents.md` — `AbstractAgent` conceptual overview
- `concepts/middleware.md` — pipeline mechanics
- `concepts/events.md` — every event type the subscriber methods cover
- `quickstart/middleware.md` — building a real `AbstractAgent` subclass
- `quickstart/client.md` — consuming events in an app
