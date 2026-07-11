# Interrupts

Source: `submodules/ag-ui/docs/concepts/interrupts.mdx`

The interrupt-aware run lifecycle for human-in-the-loop pauses. Open this file
for the `Interrupt` type, contract rules, error handling, the reason taxonomy,
and worked examples (approve, approve-with-edits, parallel, non-tool input).

## Core idea

Agents sometimes need to pause: to get human approval before a sensitive
action, to request structured input, to wait on an out-of-band policy decision.
AG-UI exposes this as a **terminal model** — the run ends with an interrupt
outcome, and the client starts a **new run** that carries per-interrupt
responses.

This is intentionally simple: no separate `PAUSE`/`RESUME` events, no mid-run
state-machine. A run either succeeds, errors, or terminates with an interrupt;
resuming is just another `RunStarted`.

## Lifecycle

```text
Agent emits state/messages required for resume
      ↓
Agent emits RunFinished { outcome: { type: "interrupt", interrupts: [...] } }
      ↓
User resolves the interrupts in the UI
      ↓
Client posts RunAgentInput { threadId, resume: [{ interruptId, status, payload? }, ...] }
      ↓
Agent emits RunStarted (new runId), continues, emits ToolCallResult (for tool-bound
interrupts), emits RunFinished { outcome: { type: "success" } }
```

## Run outcomes (revisited)

`RunFinished` carries an optional `outcome` field — a discriminated union:

```typescript
type RunFinishedOutcome =
  | { type: "success" }
  | { type: "interrupt"; interrupts: Interrupt[] }

type RunFinishedEvent = {
  type: "RUN_FINISHED"
  threadId: string
  runId: string
  result?: unknown        // root-level for back-compat with legacy producers
  outcome?: RunFinishedOutcome
}
```

- **omitted** — legacy/back-compat normal completion. Clients only inspect
  `outcome` when they care about interrupts.
- `{ type: "success" }` — normal completion.
- `{ type: "interrupt", interrupts: [...] }` — paused.

## The `Interrupt` type

```typescript
type Interrupt = {
  id: string
  reason: string
  message?: string
  toolCallId?: string
  responseSchema?: JsonSchema
  expiresAt?: string             // ISO 8601
  metadata?: Record<string, any>
}
```

| Field | Purpose |
| --- | --- |
| `id` | Correlation across interrupt, resume, idempotency, audit. |
| `reason` | Categorical routing hint — see [Reason taxonomy](#reason-taxonomy). |
| `message` | Human-readable prompt. Universal fallback UI content. |
| `toolCallId` | Binds the interrupt to a prior `ToolCall*` sequence. |
| `responseSchema` | JSON Schema for the expected `resume.payload`. |
| `expiresAt` | Optional TTL. Stale resumes produce `RunError`. |
| `metadata` | Framework-specific free-form (e.g. LangGraph checkpoint IDs). |

## Resuming a run

```typescript
type RunAgentInput = {
  // ... existing fields
  resume?: Array<{
    interruptId: string
    status: "resolved" | "cancelled"
    payload?: any
  }>
}
```

- `resolved` — user responded. `payload` is validated against the interrupt's
  `responseSchema`. **Denials live inside the payload** (e.g.
  `{ approved: false }`), not as a separate status.
- `cancelled` — user abandoned without meaningful input. `payload` omitted.

## Contract rules (memorize these)

1. **Same thread.** Resume must use the same `threadId` as the interrupted run.
2. **Resume linkage.** Each `resume[].interruptId` must reference an `id` from
   the interrupted run's `interrupts[]`. `parentRunId` is orthogonal (retains
   AG-UI branching/time-travel semantics).
3. **Cover all open interrupts.** A single `resume` array must address every
   open interrupt from the interrupted run. **No partial resumes.**
4. **Pending interrupts block new input.** Any `RunAgentInput` on a thread
   with unresolved interrupts must include a `resume`. Otherwise the agent
   must emit `RunError`.
5. **Idempotency.** A resume with the same `(threadId, interruptId, status,
   payload)` must be safe to replay.
6. **Payload validation.** If `responseSchema` is set, the agent may validate
   and emit `RunError` on mismatch. Clients should validate first.
7. **Expiry enforcement.** Clients must not submit resumes past `expiresAt`.
   Stale resumes → `RunError`.
8. **Graceful handling.** Agents emit `RunError` on missing/invalid resume
   payloads — never fail silently.

## State at the interrupt boundary

At the moment of interrupt, the agent emits the state required for resume via
`StateSnapshot` and `MessagesSnapshot` **before** the `RunFinished` carrying
the interrupt outcome.

This makes the protocol resume-mode-agnostic: both replay-style (rebuild
context from messages + state) and checkpoint-style (restore a suspended
coroutine) continuations produce identical observable behavior. Framework-
native checkpointing is an implementation optimization, not a protocol
contract.

## Error handling

`RunError` is the only error event. `outcome` does not carry an `"error"`
variant. Interrupt-specific conditions that produce `RunError`:

- Resume arrives past `expiresAt`.
- Resume payload fails validation against `responseSchema`.
- Resume references an `interruptId` the agent can't correlate.
- Resume fails to address every open interrupt (rule 3 violated).
- `RunAgentInput` on a pending-interrupt thread omits `resume` (rule 4
  violated).

## Reason taxonomy

`reason` is a required string. A small set of core values are spec-defined;
other strings are valid extensions.

### Core values

| Value | Semantics | Companion fields |
| --- | --- | --- |
| `tool_call` | Interrupt bound to a specific tool call awaiting decision | `toolCallId` must be set |
| `input_required` | Agent needs structured input to continue | `responseSchema` should be set |
| `confirmation` | Free-standing yes/no not bound to a tool | `responseSchema` optional; boolean default |

### Custom reasons

Any string. Agents should namespace as `<framework>:<name>` —
`langgraph:database_modification`, `mastra:workflow_suspend`. The `core:`
prefix is reserved for future spec additions.

### Client routing

- Switch on known core values for dedicated UI.
- For unknown reasons, **don't error** — render from `message`,
  `responseSchema`, and `metadata`.

## Tool-bound interrupts

When `reason: "tool_call"` and `toolCallId` are set, the call and its
resolution span two runs:

1. `ToolCallArgs` from the interrupted run — the agent's proposal.
2. `RunAgentInput.resume` payload from the resumed run — user decision and
   edits.
3. `ToolCallResult` from the resumed run — actual execution outcome.

The agent does **not** re-emit `ToolCallStart`/`ToolCallArgs`/`ToolCallEnd`
after resume — it emits `ToolCallResult` against the original `toolCallId`.

### Approve-with-edits pattern

Recommended `responseSchema` for tool-bound interrupts:

```json
{
  "type": "object",
  "properties": {
    "approved": { "type": "boolean" },
    "editedArgs": {
      "type": "object",
      "description": "Full replacement of the tool args. Not merged."
    }
  },
  "required": ["approved"]
}
```

`editedArgs` is a **full replacement, not a merge**. Its presence in the schema
is the capability signal that the client may offer edit UI.

## Worked examples

### Minimal tool approval

Interrupt:

```json
{
  "type": "RUN_FINISHED",
  "threadId": "thread-1",
  "runId": "run-1",
  "outcome": {
    "type": "interrupt",
    "interrupts": [{
      "id": "int-abc123",
      "reason": "tool_call",
      "message": "Send email to a@b.com with subject 'Hi'?",
      "toolCallId": "tc-001",
      "responseSchema": {
        "type": "object",
        "properties": { "approved": { "type": "boolean" } },
        "required": ["approved"]
      }
    }]
  }
}
```

Resume:

```json
{
  "threadId": "thread-1",
  "runId": "run-2",
  "resume": [{ "interruptId": "int-abc123", "status": "resolved", "payload": { "approved": true } }]
}
```

Agent then emits `ToolCallResult` against `tc-001` followed by
`RunFinished { outcome: { type: "success" } }`.

### Approve with edits

Interrupt declares `editedArgs` in the schema. Client resume payload:

```json
{
  "interruptId": "int-email-edit",
  "status": "resolved",
  "payload": {
    "approved": true,
    "editedArgs": { "to": "a@b.com", "subject": "Hi", "body": "Hi (revised)" }
  }
}
```

Audit trail for the tool call: original args (run 1) → user edits (resume) →
actual outcome (run 2 `ToolCallResult`).

### Parallel interrupts

Three tool-call interrupts in a single run; client approves two, cancels one:

```json
{
  "threadId": "thread-3",
  "runId": "run-21",
  "resume": [
    { "interruptId": "i-1", "status": "resolved",  "payload": { "approved": true } },
    { "interruptId": "i-2", "status": "resolved",  "payload": { "approved": true } },
    { "interruptId": "i-3", "status": "cancelled" }
  ]
}
```

Agent emits `ToolCallResult` for the two approved tool calls; the cancelled
one is treated as not-executed.

### Non-tool structured input

```json
{
  "interrupts": [{
    "id": "int-form",
    "reason": "input_required",
    "message": "Provide the quarterly filing details.",
    "responseSchema": {
      "type": "object",
      "properties": {
        "quarter": { "type": "string", "enum": ["Q1", "Q2", "Q3", "Q4"] },
        "year": { "type": "integer", "minimum": 2000 },
        "revenue": { "type": "number" }
      },
      "required": ["quarter", "year", "revenue"]
    },
    "expiresAt": "2026-04-20T17:00:00Z"
  }]
}
```

## See also

- `events.md` — how `RunFinished` fits into the broader event stream
- `capabilities.md` — `humanInTheLoop.interrupts` / `approveWithEdits` flags
- `tools.md` — simpler tool round-trip when you don't need a full pause
