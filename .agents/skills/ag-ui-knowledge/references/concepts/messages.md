# Messages

Source: `submodules/ag-ui/docs/concepts/messages.mdx`

Message structure, roles, and multimodal input. Open this file for the exact
schemas of every message role, or when mapping between AG-UI and provider-
specific formats.

## Base shape

```typescript
interface BaseMessage {
  id: string
  role: "user" | "assistant" | "system" | "tool" | "developer" | "activity" | "reasoning"
  content?: string
  name?: string
  encryptedContent?: string  // privacy-preserving state continuity (ZDR / store:false)
}
```

`role` is the discriminator. Concrete types extend this with what they need.
`encryptedContent` lets sensitive content (e.g. reasoning chains) travel
between turns without ever being readable on the client.

AG-UI messages are **vendor-neutral**: they map cleanly to OpenAI, Anthropic,
and other providers without re-architecting your app when you switch.

## Message types

### UserMessage

```typescript
interface UserMessage {
  id: string
  role: "user"
  content: string | InputContent[]  // text OR multimodal array
  name?: string
}
```

`InputContent` supports text, image, audio, video, document — each with a
`source` that's either inline data or a URL:

```typescript
type InputContent =
  | TextInputContent
  | ImageInputContent
  | AudioInputContent
  | VideoInputContent
  | DocumentInputContent

interface InputContentDataSource { type: "data"; value: string; mimeType: string }
interface InputContentUrlSource  { type: "url";  value: string; mimeType?: string }
type InputContentSource = InputContentDataSource | InputContentUrlSource

interface TextInputContent     { type: "text";     text: string }
interface ImageInputContent    { type: "image";    source: InputContentSource; metadata?: Record<string, unknown> }
interface AudioInputContent    { type: "audio";    source: InputContentSource; metadata?: Record<string, unknown> }
interface VideoInputContent    { type: "video";    source: InputContentSource; metadata?: Record<string, unknown> }
interface DocumentInputContent { type: "document"; source: InputContentSource; metadata?: Record<string, unknown> }
```

> In Python, the older `BinaryInputContent` model is deprecated and kept as a
> temporary compatibility shim.

### AssistantMessage

```typescript
interface AssistantMessage {
  id: string
  role: "assistant"
  content?: string            // optional when the message is purely tool calls
  name?: string
  toolCalls?: ToolCall[]
  encryptedContent?: string
}
```

### SystemMessage

```typescript
interface SystemMessage {
  id: string
  role: "system"
  content: string
  name?: string
}
```

### ToolMessage

Result returned by the frontend after executing a tool call.

```typescript
interface ToolMessage {
  id: string
  role: "tool"
  content: string         // result of execution
  toolCallId: string      // links back to the originating ToolCallStart
  error?: string          // populated on failure
  encryptedValue?: string // encrypted reasoning about how the result was interpreted
}
```

### ActivityMessage

**Frontend-only.** Never forwarded to the agent — used purely for live UI like
progress indicators, plan checklists, search-in-progress views.

```typescript
interface ActivityMessage {
  id: string
  role: "activity"
  activityType: string            // e.g. "PLAN", "SEARCH", "SCRAPE"
  content: Record<string, any>    // structured payload rendered by the frontend
}
```

Emitted via `ACTIVITY_SNAPSHOT` / `ACTIVITY_DELTA` events (see `events.md`).
Customize `activityType` and render a matching component. Because activity
messages aren't sent to the LLM, you don't have to worry about polluting the
context window with UI metadata.

### DeveloperMessage

Internal messages for development/debugging.

```typescript
interface DeveloperMessage {
  id: string
  role: "developer"
  content: string
  name?: string
}
```

### ReasoningMessage

Agent chain-of-thought, kept separate from final assistant output so it doesn't
pollute history.

```typescript
interface ReasoningMessage {
  id: string
  role: "reasoning"
  content: string         // visible-to-client reasoning summary
  encryptedValue?: string // opaque chain-of-thought blob for state continuity
}
```

Unlike `ActivityMessage`, reasoning **is** round-tripped back to the agent on
subsequent turns — that's how reasoning state persists across turns under
`store: false` / ZDR policies. See `reasoning.md`.

## Vendor neutrality (example: AG-UI → OpenAI)

```typescript
const openaiMessages = agUiMessages
  .filter((msg) => ["user", "system", "assistant"].includes(msg.role))
  .map((msg) => ({
    role: msg.role as "user" | "system" | "assistant",
    content: msg.content || "",
    ...(msg.role === "assistant" && msg.toolCalls
      ? {
          tool_calls: msg.toolCalls.map((tc) => ({
            id: tc.id,
            type: tc.type,
            function: { name: tc.function.name, arguments: tc.function.arguments },
          })),
        }
      : {}),
  }))
```

The mapping is mechanical because AG-UI doesn't invent new field names — it
standardizes the union of what providers already use.

## Message synchronization

Two complementary mechanisms (full details in `events.md`):

- **`MESSAGES_SNAPSHOT`** — complete view of all messages. Use for init, after
  connection interruptions, or to reset client state.
- **Streaming triads** — `TEXT_MESSAGE_START` → `TEXT_MESSAGE_CONTENT*` →
  `TEXT_MESSAGE_END` for real-time text. Same pattern for `TOOL_CALL_*` and
  `REASONING_MESSAGE_*`.

## Tool integration in messages

Tool calls are embedded inside assistant messages:

```typescript
interface ToolCall {
  id: string
  type: "function"
  function: { name: string; arguments: string }  // arguments is JSON-encoded
}
```

A full tool round-trip in the history:

```typescript
[
  { id: "msg_1", role: "user", content: "What's the weather in NYC?" },
  {
    id: "msg_2",
    role: "assistant",
    content: "Let me check.",
    toolCalls: [{
      id: "call_1",
      type: "function",
      function: { name: "get_weather", arguments: '{"location":"New York","unit":"celsius"}' },
    }],
  },
  { id: "result_1", role: "tool", content: '{"temperature":22,"condition":"Partly Cloudy"}', toolCallId: "call_1" },
  { id: "msg_3", role: "assistant", content: "Partly cloudy, 22°C." },
]
```

Streaming variants (`TOOL_CALL_START` / `ARGS` / `END`) let the UI show the
arguments being constructed in real time.

## See also

- `events.md` — `TEXT_MESSAGE_*`, `TOOL_CALL_*`, `REASONING_*`, `MESSAGES_SNAPSHOT`
- `tools.md` — how tools are defined and round-tripped
- `reasoning.md` — visibility and encryption of reasoning messages
