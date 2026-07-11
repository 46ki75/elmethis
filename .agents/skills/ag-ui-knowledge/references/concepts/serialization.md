# Serialization

Source: `submodules/ag-ui/docs/concepts/serialization.mdx`

Stream serialization, compaction, branching, and lineage tracking. Open this
file when persisting event streams, rebuilding history, or implementing
time-travel/branching.

## Why serialize

A serialized event stream lets you:

- Restore chat history and UI state after reloads or reconnects.
- Attach to running agents and continue receiving events.
- Branch from any prior run (time travel, alternative paths).
- Compact stored history to reduce size without losing meaning.

## Core concepts

- **Stream serialization** — convert the full event history to/from a portable
  representation (JSON) for database/file/log storage.
- **Event compaction** — reduce verbose streams to snapshots while preserving
  semantics (merge content chunks, collapse deltas into snapshots).
- **Run lineage** — track branches via `parentRunId`, forming a git-like
  append-only log.

## Updated event fields

`RunStarted` (full shape):

```typescript
type RunStartedEvent = BaseEvent & {
  type: EventType.RUN_STARTED
  threadId: string
  runId: string
  parentRunId?: string  // branching / time-travel pointer within the thread
  input?: AgentInput    // exact agent input for this run; may omit messages already in history
}
```

`parentRunId` enables lineage; `input` lets implementations record exactly
what was passed to the agent independent of previously recorded messages.

## Event compaction

Reduce noise without changing the observable outcome:

```typescript
declare function compactEvents(events: BaseEvent[]): BaseEvent[]
```

Common rules:

- **Message streams** — combine `TEXT_MESSAGE_*` sequences into a single
  message snapshot; concatenate adjacent `TEXT_MESSAGE_CONTENT` for the same
  message id.
- **Tool calls** — collapse `TOOL_CALL_START`/`ARGS`/`END` into a compact
  record.
- **State** — merge consecutive `STATE_DELTA` into a final `STATE_SNAPSHOT`;
  discard superseded updates.
- **Run input normalization** — remove from `RunStarted.input.messages` any
  messages already present earlier in the stream.

### Example

Before:

```typescript
[
  { type: "TEXT_MESSAGE_START",   messageId: "msg1", role: "user" },
  { type: "TEXT_MESSAGE_CONTENT", messageId: "msg1", delta: "Hello " },
  { type: "TEXT_MESSAGE_CONTENT", messageId: "msg1", delta: "world" },
  { type: "TEXT_MESSAGE_END",     messageId: "msg1" },
  { type: "STATE_DELTA", patch: { op: "add",     path: "/foo", value: 1 } },
  { type: "STATE_DELTA", patch: { op: "replace", path: "/foo", value: 2 } },
]
```

After:

```typescript
[
  { type: "MESSAGES_SNAPSHOT", messages: [{ id: "msg1", role: "user", content: "Hello world" }] },
  { type: "STATE_SNAPSHOT",    state: { foo: 2 } },
]
```

## Branching with `parentRunId`

Setting `parentRunId` on `RunStarted` creates a git-like lineage. The stream
becomes immutable and append-only — each run can branch from any previous run.

```text
  run1
   │
  run2
   ├── run3 (parent: run2)
   │   └── run4
   └── run5 (parent: run2)
       └── run6
```

Benefits:

- Multiple branches in the same serialized log.
- Immutable history.
- Deterministic time travel to any point.

### Example

```typescript
// Original
{ type: "RUN_STARTED", threadId: "thread1", runId: "run1",
  input: { messages: ["Tell me about Paris"] } }

// Branch from run1
{ type: "RUN_STARTED", threadId: "thread1", runId: "run2",
  parentRunId: "run1",
  input: { messages: ["Actually, tell me about London instead"] } }
```

## Normalized input

Avoid re-serializing messages already in history:

```typescript
{ type: "RUN_STARTED", runId: "run1",
  input: { messages: [{ id: "msg1", role: "user", content: "Hello" }] } }

{ type: "RUN_STARTED", runId: "run2",
  input: { messages: [{ id: "msg2", role: "user", content: "How are you?" }] } }
  // msg1 omitted — it's already in history from run1
```

## Basic (de)serialization

```typescript
const events: BaseEvent[] = [/* … */]
const serialized = JSON.stringify(events)
await storage.save(threadId, serialized)

// Restore and compact later
const restored = JSON.parse(await storage.load(threadId))
const compacted = compactEvents(restored)
```

## Implementation notes

- Provide SDK helpers for compaction and (de)serialization rather than
  hand-rolling in every app.
- Store streams **append-only** — prefer incremental writes.
- Consider compression for long histories.
- Index by `threadId`, `runId`, and timestamps for fast retrieval.

## See also

- `events.md` — `RUN_STARTED` field reference including `parentRunId` and `input`
- `state.md` — snapshot/delta interaction with compaction
- `interrupts.md` — state captured before an interrupt boundary
