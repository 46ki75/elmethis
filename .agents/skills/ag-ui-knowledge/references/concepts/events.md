# Events

Source: `submodules/ag-ui/docs/concepts/events.mdx`

The full event taxonomy. AG-UI is event-based — every interaction between an
agent and a frontend is a stream of typed, discriminated events. Open this file
when you need exact field names, property tables, or to confirm event ordering.

## Base shape

Every event inherits from `BaseEvent`:

```typescript
interface BaseEvent {
  type: EventType   // discriminator (e.g. "RUN_STARTED")
  timestamp?: number
  rawEvent?: any    // original event when transformed from another protocol
}
```

Two recurring patterns:

- **Start-Content-End** — streaming content (text messages, tool calls,
  reasoning). A `*_CHUNK` convenience event auto-opens/closes the triad.
- **Snapshot-Delta** — state synchronization. Snapshot replaces; delta mutates
  via RFC 6902 JSON Patch.

Events with the same correlation ID (`messageId`, `toolCallId`) belong to one
logical stream and should be processed in order received.

## Lifecycle

`RUN_STARTED` and exactly one terminal event (`RUN_FINISHED` or `RUN_ERROR`)
bound a run. `STEP_STARTED`/`STEP_FINISHED` pairs are optional but recommended
for observability.

```text
RunStarted → [StepStarted/StepFinished]* → (RunFinished | RunError)
```

### RunStarted

| Field | Notes |
| --- | --- |
| `threadId` | Conversation thread id |
| `runId` | This run's id |
| `parentRunId?` | Lineage pointer for branching / time travel within the thread |
| `input?` | Exact `RunAgentInput` for this run (may omit messages already in history) |

### RunFinished

| Field | Notes |
| --- | --- |
| `threadId`, `runId` | required |
| `result?` | Free-form completion payload (root for back-compat) |
| `outcome?` | Discriminated union: `{ type: "success" }` or `{ type: "interrupt", interrupts: Interrupt[] }`. Omitted = legacy normal completion |

When `outcome.type === "interrupt"`, the run paused; the client must start a
new run with `RunAgentInput.resume` addressing every interrupt id. See
`interrupts.md`.

### RunError

| Field | Notes |
| --- | --- |
| `message` | Human-readable error message |
| `code?` | Optional error code |

Terminal — no further events for this run.

### StepStarted / StepFinished

Both carry `{ stepName }`. Step names must match across the pair. Stepping
isn't mandatory but enables progress UIs.

## Text messages

```text
TextMessageStart → TextMessageContent* → TextMessageEnd
```

| Event | Fields |
| --- | --- |
| `TextMessageStart` | `messageId`, `role` (`developer` \| `system` \| `assistant` \| `user` \| `tool`) |
| `TextMessageContent` | `messageId`, `delta` (non-empty text chunk) |
| `TextMessageEnd` | `messageId` |
| `TextMessageChunk` | `messageId?`, `role?`, `delta?` — first chunk must include `messageId`; role defaults to `assistant`. Stream transformer expands chunks into the Start/Content/End triad. End is emitted automatically when the stream switches to a new message id or completes. |

Concatenate deltas in receipt order to reconstruct the full message.

## Tool calls

```text
ToolCallStart → ToolCallArgs* → ToolCallEnd → (later) ToolCallResult
```

| Event | Fields |
| --- | --- |
| `ToolCallStart` | `toolCallId`, `toolCallName`, `parentMessageId?` |
| `ToolCallArgs` | `toolCallId`, `delta` (JSON fragment) |
| `ToolCallEnd` | `toolCallId` |
| `ToolCallResult` | `messageId`, `toolCallId`, `content`, `role?` (typically `"tool"`) |
| `ToolCallChunk` | `toolCallId?`, `toolCallName?`, `parentMessageId?`, `delta?` — first chunk must include `toolCallId` + `toolCallName` |

The `delta` deltas concatenate into a JSON-encoded arguments object.
`ToolCallResult` is sent as a complete unit (not streamed).

## State management

```text
StateSnapshot → StateDelta* → (occasional) StateSnapshot → StateDelta* → MessagesSnapshot
```

| Event | Fields |
| --- | --- |
| `StateSnapshot` | `snapshot` (complete state object — replace, don't merge) |
| `StateDelta` | `delta` (`JsonPatchOperation[]`, RFC 6902) |
| `MessagesSnapshot` | `messages` (full conversation history) |

JSON Patch operations: `add`, `remove`, `replace`, `move`, `copy`, `test`,
each with `path` (RFC 6901 JSON Pointer) and `value`/`from` as needed.

On patch failure, request a fresh snapshot rather than guessing. The reference
implementation uses the `fast-json-patch` library and applies patches without
mutating the original document.

## Activity events

Structured, in-progress UI updates between chat messages. **Frontend-only**:
never round-tripped to the agent. Follow the snapshot/delta pattern.

| Event | Fields |
| --- | --- |
| `ActivitySnapshot` | `messageId`, `activityType` (e.g. `"PLAN"`, `"SEARCH"`), `content` (structured JSON), `replace?` (default `true`; if `false`, skip when the message already exists) |
| `ActivityDelta` | `messageId`, `activityType`, `patch` (RFC 6902 ops to apply to the activity content) |

Use to render checklists, search-in-progress UI, multi-step plan trackers.

## Reasoning

Surface LLM chain-of-thought while supporting privacy/ZDR. See `reasoning.md`
for the full story.

```text
ReasoningStart → ReasoningMessageStart → ReasoningMessageContent* → ReasoningMessageEnd → (optional) ReasoningEncryptedValue → ReasoningEnd
```

| Event | Fields |
| --- | --- |
| `ReasoningStart` | `messageId` |
| `ReasoningMessageStart` | `messageId`, `role` (`"reasoning"`) |
| `ReasoningMessageContent` | `messageId`, `delta` |
| `ReasoningMessageEnd` | `messageId` |
| `ReasoningMessageChunk` | `messageId`, `delta` — empty delta closes the message |
| `ReasoningEnd` | `messageId` |
| `ReasoningEncryptedValue` | `subtype` (`"message"` \| `"tool-call"`), `entityId`, `encryptedValue` (opaque blob the client stores and forwards back unchanged) |

## Special events

| Event | Fields | Purpose |
| --- | --- | --- |
| `Raw` | `event` (original payload), `source?` | Pass through events from external systems |
| `Custom` | `name`, `value` | Application-specific events not covered by the standard set |

Use `Custom` (not `Raw`) for app extensions you control — `Raw` is a passthrough
container for interop.

## Draft events

### MetaEvent

Side-band annotations independent of agent runs (e.g. `"thumbs_up"`, `"tag"`).
Fields: `metaType`, `payload`. Draft — may change before finalization.

## Deprecated (removed in v1.0.0)

`THINKING_*` events are deprecated. Map to `REASONING_*`:

| Deprecated | Replacement |
| --- | --- |
| `THINKING_START` | `REASONING_START` |
| `THINKING_END` | `REASONING_END` |
| `THINKING_TEXT_MESSAGE_START` | `REASONING_MESSAGE_START` |
| `THINKING_TEXT_MESSAGE_CONTENT` | `REASONING_MESSAGE_CONTENT` |
| `THINKING_TEXT_MESSAGE_END` | `REASONING_MESSAGE_END` |

## Implementation notes

- Process events in receipt order.
- Be resilient to out-of-order delivery on flaky transports; correlate by id.
- Custom events should follow Start/Content/End or Snapshot/Delta patterns for
  consistency.
- `parentRunId` on `RunStarted` creates a git-like append-only log for
  branching/time travel.
