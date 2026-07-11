# State Management

Source: `submodules/ag-ui/docs/concepts/state.mdx`

Shared-state architecture and JSON-Patch delta mechanics. Open this file when
implementing snapshot/delta synchronization, designing a state object, or
debugging patch failures.

## Shared-state model

State in AG-UI is a structured JSON object that:

1. Persists across interactions with an agent.
2. Is accessible to both the agent and the frontend.
3. Updates in real time as the run progresses.
4. Provides context for decisions on both sides.

It's a bidirectional channel — agents read application state to make informed
decisions; frontends observe agent state changes to react in the UI.

## Two synchronization mechanisms

### `STATE_SNAPSHOT`

Complete state representation at a point in time.

```typescript
interface StateSnapshotEvent {
  type: EventType.STATE_SNAPSHOT
  snapshot: any  // entire state object
}
```

Use for:

- Initial state at the start of an interaction.
- Recovery after connection interruptions.
- Major state changes that warrant a full refresh.
- Establishing a new baseline for future deltas.

On receipt the frontend **replaces** its state — don't merge.

### `STATE_DELTA`

Incremental updates as RFC 6902 JSON Patch operations.

```typescript
interface StateDeltaEvent {
  type: EventType.STATE_DELTA
  delta: JsonPatchOperation[]
}
```

Bandwidth-efficient — send only what changed. Best for:

- Frequent small updates during streaming.
- Large state objects where most fields are stable.
- High-frequency updates that would be wasteful as full snapshots.

## JSON Patch (RFC 6902)

```typescript
interface JsonPatchOperation {
  op: "add" | "remove" | "replace" | "move" | "copy" | "test"
  path: string   // JSON Pointer (RFC 6901)
  value?: any    // for add, replace
  from?: string  // for move, copy
}
```

Examples:

```json
{ "op": "add",     "path": "/user/preferences", "value": { "theme": "dark" } }
{ "op": "replace", "path": "/conversation_state", "value": "paused" }
{ "op": "remove",  "path": "/temporary_data" }
{ "op": "move",    "from": "/pending_items/0", "path": "/completed_items" }
```

Apply in order. If a patch fails (e.g. `replace` on a missing path), request a
fresh `STATE_SNAPSHOT` rather than guessing.

## Reference implementation

The AG-UI client uses `fast-json-patch`:

```typescript
case EventType.STATE_DELTA: {
  const { delta } = event as StateDeltaEvent
  try {
    const result = applyPatch(state, delta, true, false)  // validate, no mutate
    state = result.newDocument
    return emitUpdate({ state })
  } catch (error) {
    console.warn(`Failed to apply state patch: ${error}`)
    return emitNoUpdate()
  }
}
```

Atomic application, no mutation of the original document, errors caught
gracefully.

## `MESSAGES_SNAPSHOT`

Separate snapshot specifically for conversation history:

```typescript
interface MessagesSnapshotEvent {
  type: EventType.MESSAGES_SNAPSHOT
  messages: Message[]
}
```

Use to (re)initialize chat history or sync after a reconnect.

## Human-in-the-loop collaboration

Shared state is the substrate for human-in-the-loop UX:

- **Visibility** — users see the agent's current intent.
- **Contextual awareness** — agent reads user actions/preferences.
- **Collaborative decisions** — both contribute to the evolving state.
- **Feedback loops** — humans can correct or guide by editing state.

Example: agent proposes an action via state, user reviews/edits/approves.

```json
{
  "proposal": {
    "action": "send_email",
    "recipient": "client@example.com",
    "content": "Draft email content..."
  }
}
```

Critical: at an interrupt boundary the agent must emit any state required for
resume via `STATE_SNAPSHOT` and `MESSAGES_SNAPSHOT` **before** the
`RUN_FINISHED` interrupt event. This keeps the protocol resume-mode-agnostic
(both replay-style and checkpoint-style continuations work). See
`interrupts.md`.

## CopilotKit integration

CopilotKit exposes shared state via React's `useCoAgent`:

```jsx
const { state: agentState, setState: setAgentState } = useCoAgent({
  name: "agent",
  initialState: { someProperty: "initialValue" },
})
```

On the agent side (LangGraph example):

```python
async def tool_node(self, state: ResearchState, config: RunnableConfig):
    tool_state = {
        "title": new_state.get("title", ""),
        "outline": new_state.get("outline", {}),
        "sections": new_state.get("sections", []),
    }
    await copilotkit_emit_state(config, tool_state)
    return tool_state
```

These calls produce `STATE_SNAPSHOT` / `STATE_DELTA` events under the hood.

## Best practices

1. Use **snapshots sparingly** — only when establishing a baseline. Otherwise
   prefer deltas.
2. **Structure state for patches.** Flat-ish objects with stable keys patch
   better than deeply nested arrays.
3. **Handle conflicts.** If both sides can write, define resolution rules
   (last-write-wins, server-authoritative, CRDT, etc.).
4. **Recover gracefully.** Detect divergence and resync via snapshot.
5. **Don't store secrets** in shared state — it's visible to the frontend.
6. **Emit state before interrupts.** Required for resume; see `interrupts.md`.

## See also

- `events.md` — `STATE_SNAPSHOT`, `STATE_DELTA`, `MESSAGES_SNAPSHOT` field tables
- `interrupts.md` — state at the interrupt boundary
- `messages.md` — message history sync
- `serialization.md` — compacting state deltas across long sessions
