# Agents

Source: `submodules/ag-ui/docs/concepts/agents.mdx`

The agent abstraction in AG-UI. Open this file for the `AbstractAgent` lifecycle,
configuration shape, and the common implementation patterns.

## What an agent is

An AG-UI agent is a class that:

1. Manages conversation state and message history.
2. Processes incoming messages and context.
3. Generates responses through an event-driven streaming interface.
4. Follows the AG-UI protocol for communication.

Backends behind an agent can be anything: an LLM (GPT-4o, Claude), a RAG
system, a multi-agent orchestrator, or a custom service.

## Base class — `AbstractAgent`

All agents extend `AbstractAgent` (from `@ag-ui/client` in TypeScript). It
provides state management, message-history tracking, event-stream processing,
and tool wiring; subclasses implement `run()`.

```typescript
import { AbstractAgent } from "@ag-ui/client"

class MyAgent extends AbstractAgent {
  run(input: RunAgentInput): RunAgent {
    // emit events
  }
}
```

### Components every agent has

| Component | Purpose |
| --- | --- |
| **Configuration** | `agentId`, `threadId`, `initialMessages`, `initialState` |
| **Messages** | Conversation history (`user`, `assistant`, `system`, `tool`, `developer`, `activity`, `reasoning`) |
| **State** | Structured JSON that persists across interactions, shared with the frontend |
| **Events** | Standardized stream emitted by `run()` |
| **Tools** | Functions defined by the frontend and passed in `RunAgentInput.tools` |

## Built-in implementations

### `AbstractAgent`

Base class to extend for custom agents.

### `HttpAgent`

Concrete subclass that connects to an HTTP endpoint:

```typescript
import { HttpAgent } from "@ag-ui/client"

const agent = new HttpAgent({
  url: "https://your-agent-endpoint.com/agent",
  headers: { Authorization: "Bearer your-api-key" },
})
```

See `references/sdks/typescript.md` for the full `HttpAgent` API.

### Custom agents

Extend `AbstractAgent`; implement `run(input)`. Pattern below.

## Minimal `run()` implementation (TypeScript)

```typescript
import {
  AbstractAgent,
  RunAgent,
  RunAgentInput,
  EventType,
  BaseEvent,
} from "@ag-ui/client"
import { Observable } from "rxjs"

class SimpleAgent extends AbstractAgent {
  run(input: RunAgentInput): RunAgent {
    const { threadId, runId } = input

    return () =>
      new Observable<BaseEvent>((observer) => {
        observer.next({ type: EventType.RUN_STARTED, threadId, runId })

        const messageId = Date.now().toString()
        observer.next({ type: EventType.TEXT_MESSAGE_START, messageId, role: "assistant" })
        observer.next({ type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta: "Hello, world!" })
        observer.next({ type: EventType.TEXT_MESSAGE_END, messageId })

        observer.next({ type: EventType.RUN_FINISHED, threadId, runId })
        observer.complete()
      })
  }
}
```

## Configuration

```typescript
interface AgentConfig {
  agentId?: string         // unique identifier
  description?: string     // human-readable description (also used by the LLM)
  threadId?: string        // conversation thread
  initialMessages?: Message[]
  initialState?: State
}

const agent = new HttpAgent({
  agentId: "my-agent-123",
  description: "A helpful assistant",
  threadId: "thread-456",
  initialMessages: [{ id: "1", role: "system", content: "You are a helpful assistant." }],
  initialState: { preferredLanguage: "English" },
})
```

To add custom config to a subclass, extend `AgentConfig` and call `super(config)`:

```typescript
interface MyAgentConfig extends AgentConfig {
  myConfigOption: string
}

class MyAgent extends AbstractAgent {
  private myConfigOption: string
  constructor(config: MyAgentConfig) {
    super(config)
    this.myConfigOption = config.myConfigOption
  }
}
```

## Capabilities at a glance

Agents in AG-UI can support:

- **Streaming responses** — token-by-token via the `TEXT_MESSAGE_*` triad.
- **Tool use** — frontend-defined tools passed in `RunAgentInput.tools`; the
  agent calls them via `TOOL_CALL_*` events.
- **Shared state** — `STATE_SNAPSHOT` / `STATE_DELTA` events; client and agent
  both read and update it.
- **Multi-agent collaboration** — handoffs and delegation, with state and
  context flowing across agents.
- **Human-in-the-loop** — interrupt-aware run lifecycle (see `interrupts.md`).
- **Conversational memory** — `agent.messages` is the canonical history.
- **Metadata/instrumentation** — emit reasoning events, custom events for
  metrics, etc.

## Using an agent

```typescript
const agent = new HttpAgent({ url: "https://your-agent-endpoint.com/agent" })

agent.messages = [{ id: "1", role: "user", content: "Hello, how can you help?" }]

agent.runAgent({ runId: "run_123", tools: [], context: [] }).subscribe({
  next: (event) => {
    if (event.type === EventType.TEXT_MESSAGE_CONTENT) {
      console.log("Content:", event.delta)
    }
  },
  error: (e) => console.error(e),
  complete: () => console.log("done"),
})
```

State and messages are exposed as live properties on the agent instance
(`agent.state`, `agent.messages`). `agent.clone()` deep-copies the agent with
its current state.

## When you write a custom agent

- Emit `RUN_STARTED` first and exactly one terminal event (`RUN_FINISHED` or
  `RUN_ERROR`).
- Emit any state required for resume **before** a `RUN_FINISHED` with an
  interrupt outcome (see `interrupts.md`).
- Use `*_CHUNK` events (`TEXT_MESSAGE_CHUNK`, `TOOL_CALL_CHUNK`) for the
  simplest streaming code — they auto-open/close their triads.
- For long-running runs, emit `STEP_STARTED`/`STEP_FINISHED` around each phase
  so the UI can show progress.

## See also

- `events.md` — every event the agent can emit
- `messages.md` — message schema and roles
- `state.md` — shared-state mechanics
- `tools.md` — frontend-defined tool flow
- `interrupts.md` — human-in-the-loop lifecycle
- `references/sdks/typescript.md` — concrete `AbstractAgent`/`HttpAgent` API
