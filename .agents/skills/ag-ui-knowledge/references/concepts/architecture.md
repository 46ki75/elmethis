# Architecture

Source: `submodules/ag-ui/docs/concepts/architecture.mdx`

AG-UI's design rationale and component model. Open this file when reasoning
about transport choices, where middleware sits, or how the moving pieces fit
together.

## Design principles

1. **Event-driven communication.** Agents emit any of ~16 standardized event
   types during execution, creating a stream the client processes.
2. **Bidirectional interaction.** Agents accept user input through tools,
   interrupts, and shared state — collaboration, not one-shot RPC.
3. **Built-in middleware layer.** Two consequences:
   - **Flexible event structure.** Events don't need to match AG-UI's wire
     format exactly — just be AG-UI-compatible. Existing frameworks can adapt
     their native events with minimal effort.
   - **Transport agnostic.** AG-UI doesn't mandate how events are delivered
     (SSE, WebSockets, webhooks, HTTP binary, anything else).

This pragmatism is why AG-UI integrates with so many agent frameworks without
forcing rewrites.

## Architectural overview

```text
┌────────────── Frontend ──────────────┐      ┌─────── Backend ────────┐
│                                      │      │                        │
│   Application  <───►  AG-UI Client   │◄────►│   AI Agent A           │
│                                      │      │                        │
└──────────────────────────────────────┘  ┌──►│   Secure Proxy ───► AI Agent B
                                          │   │                  └── AI Agent C
                                          │   └────────────────────────┘
                                          │
                                          │ (proxies AG-UI for multiple agents)
```

- **Application** — user-facing app (chat, copilot, custom UI).
- **AG-UI Client** — `HttpAgent` or a specialized client for a sister protocol.
- **Agent** — backend AI agent processing requests and emitting events.
- **Secure proxy** — optional layer that fronts multiple agents and adds
  cross-cutting concerns (auth, rate limiting, multi-tenant routing).

## Core abstractions

### Protocol layer

The single contract:

```typescript
type RunAgent = () => Observable<BaseEvent>

class MyAgent extends AbstractAgent {
  run(input: RunAgentInput): RunAgent {
    return () =>
      from([
        { type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId },
        { type: EventType.MESSAGES_SNAPSHOT, messages: [{ id: "msg_1", role: "assistant", content: "Hello, world!" }] },
        { type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId },
      ])
  }
}
```

Implementing `run(input: RunAgentInput) -> Observable<BaseEvent>` (or its
language equivalent) is the entire surface area.

### Standard HTTP client (`HttpAgent`)

Connects to any endpoint that:

- Accepts a POST with body `RunAgentInput`.
- Returns a stream of `BaseEvent`.

Supports two transports out of the box:

- **HTTP SSE** — text-based, debuggable, broadly compatible.
- **HTTP binary** — protobuf-encoded for performance.

### Message types

Five families (see `events.md` for the full per-event table):

- Lifecycle: `RUN_STARTED`, `RUN_FINISHED`, `RUN_ERROR`, `STEP_STARTED`, `STEP_FINISHED`
- Text: `TEXT_MESSAGE_START`, `TEXT_MESSAGE_CONTENT`, `TEXT_MESSAGE_END`
- Tool call: `TOOL_CALL_START`, `TOOL_CALL_ARGS`, `TOOL_CALL_END`
- State: `STATE_SNAPSHOT`, `STATE_DELTA`, `MESSAGES_SNAPSHOT`
- Special: `RAW`, `CUSTOM`

## Running agents (TypeScript)

```typescript
const agent = new HttpAgent({
  url: "https://your-agent-endpoint.com/agent",
  agentId: "unique-agent-id",
  threadId: "conversation-thread",
})

agent.runAgent({
  tools: [...],
  context: [...],
}).subscribe({
  next: (event) => {
    switch (event.type) {
      case EventType.TEXT_MESSAGE_CONTENT:
        // append event.delta to UI
        break
      // …
    }
  },
  error: (err) => console.error(err),
  complete: () => console.log("done"),
})
```

## Key architectural decisions worth remembering

- **All events inherit `BaseEvent`** — `{ type, timestamp?, rawEvent? }`. Lets
  middleware tag, transform, or wrap events without changing core code.
- **State uses snapshot + JSON Patch deltas.** Optimizes both completeness
  (snapshots) and efficiency (deltas).
- **Tool calls are streamed.** The `TOOL_CALL_*` triad lets the UI show the
  agent constructing arguments in real time, not just the finished call.
- **The protocol layer doesn't know about transports.** SSE is the most common
  but not privileged. A WebSocket-based AG-UI agent is still an AG-UI agent.
- **No mandatory negotiation.** Capability discovery is one-way (see
  `capabilities.md`); the agent declares, the client adapts.

## See also

- `events.md` — full event reference
- `agents.md` — `AbstractAgent` / `HttpAgent` shape
- `middleware.md` — pipeline mechanics
- `serialization.md` — compaction, branching, lineage
