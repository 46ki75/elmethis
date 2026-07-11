# Quickstart: Middleware implementation

Source: `submodules/ag-ui/docs/quickstart/middleware.mdx`

How to **translate an existing protocol or framework into AG-UI events** by
extending `AbstractAgent`. Open this file when wrapping LangGraph, CrewAI,
Mastra, an internal SDK, or any other backend you don't fully control.

## When to use this path

Pick a middleware implementation when you:

- Have an **existing protocol or API** you want to expose universally.
- Work within the confines of an **existing framework**.
- **Don't have direct control** over the upstream agent framework.

If you're building a brand-new agent from scratch, prefer the server path
(`quickstart/server.md`) for cleaner control over emitted events.

## Contract

You extend `AbstractAgent` and implement `run(input: RunAgentInput) ->
Observable<BaseEvent>`. Everything else (state, message history, event
processing, tool wiring) is provided by the base class.

```typescript
import { AbstractAgent, BaseEvent, EventType, RunAgentInput } from "@ag-ui/client"
import { Observable } from "rxjs"

export class MyFrameworkAgent extends AbstractAgent {
  run(input: RunAgentInput): Observable<BaseEvent> {
    // emit AG-UI events for each upstream-framework event
  }
}
```

## Stub agent (the starting template)

```typescript
import { AbstractAgent, BaseEvent, EventType, RunAgentInput } from "@ag-ui/client"
import { Observable } from "rxjs"

export class OpenAIAgent extends AbstractAgent {
  run(input: RunAgentInput): Observable<BaseEvent> {
    const messageId = Date.now().toString()
    return new Observable<BaseEvent>((observer) => {
      observer.next({ type: EventType.RUN_STARTED, threadId: input.threadId, runId: input.runId } as any)
      observer.next({ type: EventType.TEXT_MESSAGE_START, messageId } as any)
      observer.next({ type: EventType.TEXT_MESSAGE_CONTENT, messageId, delta: "Hello world!" } as any)
      observer.next({ type: EventType.TEXT_MESSAGE_END, messageId } as any)
      observer.next({ type: EventType.RUN_FINISHED, threadId: input.threadId, runId: input.runId } as any)
      observer.complete()
    })
  }
}
```

That's a valid (if unhelpful) AG-UI agent. Real adapters replace the hardcoded
events with translations of upstream-framework events.

## Real adapter: OpenAI in-process

```typescript
import { AbstractAgent, BaseEvent, EventType, RunAgentInput } from "@ag-ui/client"
import { Observable } from "rxjs"
import { OpenAI } from "openai"

export class OpenAIAgent extends AbstractAgent {
  private openai: OpenAI

  constructor(openai?: OpenAI) {
    super()
    this.openai = openai ?? new OpenAI() // uses OPENAI_API_KEY
  }

  run(input: RunAgentInput): Observable<BaseEvent> {
    return new Observable<BaseEvent>((observer) => {
      observer.next({
        type: EventType.RUN_STARTED,
        threadId: input.threadId,
        runId: input.runId,
      } as any)

      this.openai.chat.completions.create({
        model: "gpt-4o",
        stream: true,
        tools: input.tools.map((tool) => ({
          type: "function",
          function: {
            name: tool.name,
            description: tool.description,
            parameters: tool.parameters,
          },
        })),
        messages: input.messages.map((message) => ({
          role: message.role as any,
          content: message.content ?? "",
          ...(message.role === "assistant" && message.toolCalls
            ? { tool_calls: message.toolCalls }
            : {}),
          ...(message.role === "tool"
            ? { tool_call_id: (message as any).toolCallId }
            : {}),
        })),
      })
      .then(async (response) => {
        const messageId = Date.now().toString()

        for await (const chunk of response) {
          if (chunk.choices[0].delta.content) {
            observer.next({
              type: EventType.TEXT_MESSAGE_CHUNK,           // auto opens & closes triad
              messageId,
              delta: chunk.choices[0].delta.content,
            } as any)
          } else if (chunk.choices[0].delta.tool_calls) {
            const tc = chunk.choices[0].delta.tool_calls[0]
            observer.next({
              type: EventType.TOOL_CALL_CHUNK,
              toolCallId: tc.id,
              toolCallName: tc.function?.name,
              parentMessageId: messageId,
              delta: tc.function?.arguments,
            } as any)
          }
        }

        observer.next({
          type: EventType.RUN_FINISHED,
          threadId: input.threadId,
          runId: input.runId,
        } as any)
        observer.complete()
      })
      .catch((error) => {
        observer.next({ type: EventType.RUN_ERROR, message: error.message } as any)
        observer.error(error)
      })
    })
  }
}
```

### Pattern

1. **Set up** — initialize the upstream client; emit `RUN_STARTED`.
2. **Translate input** — convert AG-UI messages/tools into the upstream
   framework's format.
3. **Stream output** — for each upstream chunk, emit the matching AG-UI event
   (`TEXT_MESSAGE_CHUNK`, `TOOL_CALL_CHUNK`, `STATE_DELTA`, `REASONING_*`).
4. **Terminate** — emit `RUN_FINISHED` on success or `RUN_ERROR` on failure
   and complete the observable.

This shape works for nearly any backend: REST/GraphQL APIs, WebSockets, MQTT,
in-process agent frameworks.

## When you need more than `run()`

- **Custom config** — extend `AgentConfig` and call `super(config)`.
- **Authentication** — pass credentials via constructor or via
  `RunAgentParameters.forwardedProps` (the latter is per-run; useful for
  per-user auth).
- **Caching / observability** — layer in via `agent.use(middleware)` instead
  of bloating `run()`. See `concepts/middleware.md`.
- **Persistent connection** — override `connect()` for streaming use cases
  where one HTTP request handles multiple runs (e.g. server-sent push). Note
  `connectAgent()` does not run middleware in the current implementation.

## Tips

- Reach for `TEXT_MESSAGE_CHUNK` / `TOOL_CALL_CHUNK` first — they're easier
  to emit correctly than the explicit Start/Content/End triads.
- Make `run()` synchronous in setup, asynchronous in streaming. Don't
  `await` the entire upstream call before emitting `RUN_STARTED`.
- For interrupts: emit `STATE_SNAPSHOT` + `MESSAGES_SNAPSHOT` then
  `RUN_FINISHED { outcome: { type: "interrupt", interrupts: [...] } }`. The
  next `RunAgentInput.resume` array brings you back. See `concepts/interrupts.md`.

## See also

- `concepts/agents.md` — `AbstractAgent` lifecycle and helpers
- `concepts/events.md` — events you can emit
- `concepts/middleware.md` — wrapping the agent with cross-cutting behavior
- `references/sdks/typescript.md` — full `@ag-ui/client` API
