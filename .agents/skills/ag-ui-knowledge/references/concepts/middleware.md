# Middleware

Source: `submodules/ag-ui/docs/concepts/middleware.mdx` (and
`submodules/ag-ui/docs/sdk/js/client/middleware.mdx`)

Pipeline mechanics for transforming, filtering, and augmenting event streams.
Open this file when wrapping an agent with cross-cutting behavior like logging,
auth, filtering, or metrics.

## What middleware does

Middleware sits between agent execution and the event consumer. With it you
can:

1. **Transform events** — modify or enhance events on the fly.
2. **Filter events** — selectively allow or block specific event types.
3. **Add metadata** — inject tracking info.
4. **Handle errors** — custom error-recovery strategies.
5. **Monitor execution** — logging, metrics, debugging.

## Pipeline model

```typescript
import { AbstractAgent } from "@ag-ui/client"

const agent = new MyAgent()

// chain: logging → auth → filter → agent
agent.use(loggingMiddleware, authMiddleware, filterMiddleware)

await agent.runAgent()
```

Middleware added with `agent.use(...)` is applied in `runAgent()`. (Note:
`connectAgent()` currently calls `connect()` directly and does **not** run
middleware.)

## Function-based middleware

For simple transformations:

```typescript
import { MiddlewareFunction } from "@ag-ui/client"
import { EventType } from "@ag-ui/core"
import { map } from "rxjs/operators"

const prefixMiddleware: MiddlewareFunction = (input, next) => {
  return next.run(input).pipe(
    map(event => {
      if (
        event.type === EventType.TEXT_MESSAGE_CHUNK ||
        event.type === EventType.TEXT_MESSAGE_CONTENT
      ) {
        return { ...event, delta: `[AI]: ${event.delta}` }
      }
      return event
    })
  )
}

agent.use(prefixMiddleware)
```

## Class-based middleware

For stateful or configurable middleware:

```typescript
import { Middleware } from "@ag-ui/client"
import { Observable } from "rxjs"
import { tap, finalize } from "rxjs/operators"

class MetricsMiddleware extends Middleware {
  private eventCount = 0

  constructor(private metricsService: MetricsService) { super() }

  run(input: RunAgentInput, next: AbstractAgent): Observable<BaseEvent> {
    const startTime = Date.now()
    return this.runNext(input, next).pipe(
      tap(event => {
        this.eventCount++
        this.metricsService.recordEvent(event.type)
      }),
      finalize(() => {
        this.metricsService.recordDuration(Date.now() - startTime)
        this.metricsService.recordEventCount(this.eventCount)
      })
    )
  }
}

agent.use(new MetricsMiddleware(metricsService))
```

Inside class middleware prefer the helpers:

- `runNext(input, next)` — normalizes chunk events into full `TEXT_MESSAGE_*` /
  `TOOL_CALL_*` triads, so downstream code only sees the canonical events.
- `runNextWithState(input, next)` — additionally provides accumulated
  `messages` and `state` after each event, useful for middleware that needs
  context.

## Built-in middleware

### `FilterToolCallsMiddleware`

Allow- or deny-list filtering of tool calls:

```typescript
import { FilterToolCallsMiddleware } from "@ag-ui/client"

const allowedFilter = new FilterToolCallsMiddleware({ allowedToolCalls: ["search", "calculate"] })
const blockedFilter = new FilterToolCallsMiddleware({ disallowedToolCalls: ["delete", "modify"] })

agent.use(allowedFilter)
```

Note: this filters emitted `TOOL_CALL_*` events. It does **not** block tool
execution in the upstream model/runtime — those calls still happen on the
backend; you just don't see them on the client.

## Combining middleware

```typescript
const logMiddleware: MiddlewareFunction = (input, next) => next.run(input)
const metricsMiddleware = new MetricsMiddleware(metricsService)
const filterMiddleware  = new FilterToolCallsMiddleware({ allowedToolCalls: ["search"] })

agent.use(logMiddleware, metricsMiddleware, filterMiddleware)
```

## Execution order

```text
agent.use(middleware1, middleware2, middleware3)

  → middleware1
    → middleware2
      → middleware3
        → agent.run()
      ← events flow back through middleware3
    ← events flow back through middleware2
  ← events flow back through middleware1
```

The first middleware sees the original input and the final emitted events.
Each can modify input on the way down and events on the way up.

## Common patterns

### Conditional middleware

```typescript
const conditionalMiddleware: MiddlewareFunction = (input, next) => {
  if (input.forwardedProps?.debug === true) {
    return next.run(input).pipe(tap(event => console.debug(event)))
  }
  return next.run(input)
}
```

### Auth injection

Pass credentials in `RunAgentParameters.forwardedProps` and have middleware
attach them to outgoing calls — keeps secrets out of the agent's interface.

### Rate limiting

Class-based middleware with internal token-bucket state; throw or delay when
the limit is exceeded.

### Logging

Function middleware with a `tap` operator at the top of the chain.

## Best practices

1. **Single responsibility** — one concern per middleware.
2. **Handle errors gracefully** — use RxJS `catchError`.
3. **No blocking I/O** — use async patterns or push work to RxJS.
4. **Document side effects** — make state mutations explicit.
5. **Unit-test middleware in isolation.**
6. **Mind the cost** — every middleware runs on every event in the stream.

## See also

- `architecture.md` — middleware's role in the overall design
- `events.md` — events flowing through the pipeline
- `references/sdks/typescript.md` — `Middleware` class and `MiddlewareFunction`
  type definitions
