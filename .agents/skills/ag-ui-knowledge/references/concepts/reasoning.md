# Reasoning

Source: `submodules/ag-ui/docs/concepts/reasoning.mdx`

Chain-of-thought visibility, encrypted state continuity, and the deprecation
path from `THINKING_*` events. Open this file when surfacing reasoning to
users, implementing ZDR/`store: false`, or migrating older code.

## Three problems reasoning solves

| Challenge | AG-UI solution |
| --- | --- |
| **Visibility** — surface reasoning to users without exposing raw chain-of-thought | Stream a visible summary via `REASONING_MESSAGE_CONTENT`; keep details encrypted |
| **State continuity** — preserve reasoning across turns under `store: false` / ZDR | `REASONING_ENCRYPTED_VALUE` carries an opaque blob the client forwards back |
| **Privacy compliance** — meet enterprise privacy requirements | Reasoning never stored plaintext on client; encrypted values let server discard or rotate |

## `ReasoningMessage`

```typescript
interface ReasoningMessage {
  id: string
  role: "reasoning"
  content: string         // visible reasoning
  encryptedValue?: string // opaque encrypted chain-of-thought for state continuity
}
```

Key characteristics:

- **Separate from assistant messages** — keeps reasoning out of the final
  response history.
- **Streamable** — content arrives via the `REASONING_MESSAGE_*` triad.
- **Optional encryption** — when `encryptedValue` is present, the client
  treats it as opaque and forwards it back on subsequent turns.

Unlike `ActivityMessage`, reasoning **is** round-tripped back to the agent on
subsequent turns. That's how reasoning state persists across turns under
`store: false` / ZDR policies.

## Reasoning events

```text
ReasoningStart → ReasoningMessageStart → ReasoningMessageContent* → ReasoningMessageEnd
              → (optional) ReasoningEncryptedValue
              → ReasoningEnd
```

| Event | Purpose |
| --- | --- |
| `ReasoningStart` | Marks the start of a reasoning phase |
| `ReasoningMessageStart` | Begins a streaming reasoning message |
| `ReasoningMessageContent` | Delivers reasoning content chunks |
| `ReasoningMessageEnd` | Completes a reasoning message |
| `ReasoningMessageChunk` | Auto-managed convenience event; empty `delta` closes the message |
| `ReasoningEnd` | Marks completion of reasoning |
| `ReasoningEncryptedValue` | Attaches encrypted chain-of-thought to a message or tool call |

`ReasoningEncryptedValue` carries `{ subtype: "message" | "tool-call",
entityId, encryptedValue }`. The `entityId` is the message id or tool-call id
the reasoning belongs to.

## Privacy patterns

### Zero data retention (ZDR)

1. Encrypt reasoning server-side before sending.
2. Only emit a short visible summary via `REASONING_MESSAGE_*`.
3. Attach the full chain-of-thought as `REASONING_ENCRYPTED_VALUE`.
4. Client stores only the encrypted blob (cannot decrypt) and the summary
   (non-sensitive).
5. Full reasoning is never persisted in plaintext anywhere on the client.

### Visibility levels

- **Full visibility** — stream the complete chain via `REASONING_MESSAGE_CONTENT`.
- **Summary only** — short visible summary + detailed `encryptedValue`.
- **Hidden** — `REASONING_ENCRYPTED_VALUE` only, no visible streaming.

### Compliance crosswalk

| Requirement | How reasoning supports it |
| --- | --- |
| GDPR right to erasure | Encrypted content can be discarded without losing capability |
| SOC 2 data handling | Reasoning never stored plaintext on the client |
| HIPAA minimum necessary | Expose summaries; keep detail encrypted |
| Audit logging | `ReasoningStart`/`ReasoningEnd` create audit trail without exposing content |

## Examples

### Basic visible reasoning

```typescript
yield { type: "REASONING_START", messageId: "reasoning-001" }

yield { type: "REASONING_MESSAGE_START",   messageId: "msg-123", role: "reasoning" }
yield { type: "REASONING_MESSAGE_CONTENT", messageId: "msg-123", delta: "Let me " }
yield { type: "REASONING_MESSAGE_CONTENT", messageId: "msg-123", delta: "think through " }
yield { type: "REASONING_MESSAGE_CONTENT", messageId: "msg-123", delta: "this step by step..." }
yield { type: "REASONING_MESSAGE_END",     messageId: "msg-123" }

yield { type: "REASONING_END", messageId: "reasoning-001" }
```

### Encrypted continuation across turns

```typescript
yield { type: "REASONING_START", messageId: "reasoning-002" }

// Public summary
yield { type: "REASONING_MESSAGE_START",   messageId: "msg-456", role: "reasoning" }
yield { type: "REASONING_MESSAGE_CONTENT", messageId: "msg-456", delta: "Analyzing your request..." }
yield { type: "REASONING_MESSAGE_END",     messageId: "msg-456" }

// Private chain-of-thought
yield {
  type: "REASONING_ENCRYPTED_VALUE",
  subtype: "message",
  entityId: "msg-456",
  encryptedValue: "eyJhbGciOiJBMjU2R0NNIiwiZW5jIjoiQTI1NkdDTSJ9...",
}

yield { type: "REASONING_END", messageId: "reasoning-002" }

// Client stores msg-456 with encryptedValue and forwards it back next turn
```

### Encrypted reasoning attached to a tool call

```typescript
yield { type: "TOOL_CALL_START", toolCallId: "tool-123", toolCallName: "search_database", parentMessageId: "msg-789" }
yield { type: "TOOL_CALL_ARGS",  toolCallId: "tool-123", delta: '{"query": "user preferences"}' }
yield { type: "TOOL_CALL_END",   toolCallId: "tool-123" }

yield {
  type: "REASONING_ENCRYPTED_VALUE",
  subtype: "tool-call",
  entityId: "tool-123",
  encryptedValue: "encrypted-reasoning-about-tool-selection...",
}
```

Use to capture why the agent chose specific args or how it interpreted
results.

### Convenience chunk event

```typescript
yield { type: "REASONING_MESSAGE_CHUNK", messageId: "msg-789", delta: "Analyzing the problem space..." }
yield { type: "REASONING_MESSAGE_CHUNK", messageId: "msg-789", delta: " Considering multiple approaches..." }
yield { type: "REASONING_MESSAGE_CHUNK", messageId: "msg-789", delta: "" }  // empty closes the message
```

## Client handling

```typescript
import { EventType, type BaseEvent } from "@ag-ui/core"

function handleEvent(event: BaseEvent) {
  switch (event.type) {
    case EventType.REASONING_START:
      showThinkingIndicator()
      break
    case EventType.REASONING_MESSAGE_CONTENT:
      appendReasoningText(event.messageId, event.delta)
      break
    case EventType.REASONING_ENCRYPTED_VALUE:
      if (event.subtype === "message") {
        storeMessageEncryptedValue(event.entityId, event.encryptedValue)
      } else if (event.subtype === "tool-call") {
        storeToolCallEncryptedValue(event.entityId, event.encryptedValue)
      }
      break
    case EventType.REASONING_END:
      hideThinkingIndicator()
      break
  }
}
```

When making subsequent requests, include the stored encrypted values in the
message history:

```typescript
await agent.run({
  threadId: "thread-123",
  messages: [
    ...previousMessages,
    {
      id: "reasoning-002",
      role: "reasoning",
      content: "Analyzing your request...",     // visible summary
      encryptedValue: storedEncryptedBlob,      // opaque to client
    },
    { id: "user-msg-001", role: "user", content: "Follow up question..." },
  ],
})
```

## Migration from `THINKING_*`

> `THINKING_*` events are deprecated and will be removed in v1.0.0.

| Deprecated | Replacement |
| --- | --- |
| `THINKING_START` | `REASONING_START` |
| `THINKING_END` | `REASONING_END` |
| `THINKING_TEXT_MESSAGE_START` | `REASONING_MESSAGE_START` |
| `THINKING_TEXT_MESSAGE_CONTENT` | `REASONING_MESSAGE_CONTENT` |
| `THINKING_TEXT_MESSAGE_END` | `REASONING_MESSAGE_END` |

Migration steps:

1. Replace event types.
2. Use `ReasoningMessage` with `role: "reasoning"` instead of any
   thinking-specific message types.
3. Consider adding `ReasoningEncryptedValue` for privacy compliance.
4. Re-test the streaming UX end-to-end.

## Best practices

- Always pair `ReasoningStart` with `ReasoningEnd`.
- Use `ReasoningEncryptedValue` for sensitive reasoning; keep summaries terse.
- Provide visible feedback even when reasoning is encrypted — users need to
  know the agent is working.
- Be resilient to incomplete event streams.
- For very long reasoning, prefer summaries over streaming full content.

## See also

- `events.md` — full reasoning event reference
- `messages.md` — `ReasoningMessage` schema
- `serialization.md` — state continuity and lineage
- `capabilities.md` — `reasoning.{supported, streaming, encrypted}` flags
