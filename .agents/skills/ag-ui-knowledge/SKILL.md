---
name: ag-ui-knowledge
description: >
  Expert guidance for AG-UI (Agent–User Interaction Protocol) — the open,
  event-based protocol connecting AI agents to user-facing apps. Covers
  the run lifecycle, event types (lifecycle, text, tool-call, state,
  activity, reasoning), RunAgentInput, AbstractAgent/HttpAgent, multimodal
  messages, shared state via STATE_SNAPSHOT/STATE_DELTA (RFC 6902 JSON
  Patch), frontend-defined tools, interrupt-aware HITL with
  RunAgentInput.resume, encrypted reasoning for ZDR, capability discovery,
  middleware, serialization with parentRunId branching, the TypeScript
  (`@ag-ui/client`, `@ag-ui/core`) and Python (`ag-ui-protocol`) SDKs plus
  community SDKs. Use whenever someone builds or consumes AG-UI, wires up
  CopilotKit, LangGraph, CrewAI, Mastra, Pydantic AI, LlamaIndex, Agno,
  AG2, Microsoft Agent Framework, Google ADK, AWS Strands, or Bedrock
  AgentCore, or mentions AG-UI, ag_ui, RunStartedEvent, STATE_DELTA,
  TOOL_CALL_START, REASONING_*, AbstractAgent, HttpAgent, or EventEncoder.
  Always invoke.
license: MIT
metadata:
  author: "Ikuma Yamashita"
  version: "1.2.0"
---

# AG-UI Knowledge

You are an expert in the **AG-UI (Agent–User Interaction Protocol)** — the open,
event-based protocol that standardizes how AI agents communicate with
user-facing applications in real time.

## What AG-UI Is

AG-UI sits at the **Agent ↔ User Interaction** layer of the agentic-protocol
stack, alongside two siblings:

| Layer                | Protocol                         | Purpose                                                        |
| -------------------- | -------------------------------- | -------------------------------------------------------------- |
| Agent ↔ Tools / Data | **MCP** (Model Context Protocol) | Securely connect agents to tools, workflows, and data sources  |
| Agent ↔ Agent        | **A2A** (Agent to Agent)         | Coordinate work across distributed agents                      |
| **Agent ↔ User**     | **AG-UI**                        | Stream events between an agent runtime and the user-facing app |

A single agent often uses all three. AG-UI is built by CopilotKit in partnership
with LangGraph and CrewAI.

### Design principles

- **Event-driven** — every interaction is a stream of typed, discriminated
  events (see [Event categories](#event-categories)).
- **Transport-agnostic** — events flow over SSE, WebSockets, HTTP binary
  (protobuf), or anything else. AG-UI does not mandate a transport.
- **Framework-agnostic** — any backend (LangGraph, CrewAI, Mastra, custom) can
  emit AG-UI events; any frontend can consume them.
- **Bidirectional shared state** — agent and frontend share a JSON state model
  via snapshots and JSON-Patch deltas.
- **Human-in-the-loop is first-class** — agents pause mid-run by ending with
  an interrupt outcome; clients resume by starting a new run carrying the user's
  response.

## Core concepts (quick reference)

Most everyday AG-UI questions can be answered from this section without opening
a reference file. Open `references/` for full schemas, examples, or edge cases.

### Run lifecycle

Every agent interaction is a **run** on a **thread**:

1. Client POSTs a `RunAgentInput` to the agent's HTTP endpoint.
2. Agent emits `RUN_STARTED { threadId, runId }`.
3. Agent streams events (text, tool calls, state, reasoning, …).
4. Agent emits `RUN_FINISHED` or `RUN_ERROR`.
5. `RUN_FINISHED` carries an optional `outcome`:
   - omitted → legacy normal completion
   - `{ type: "success" }` → normal completion
   - `{ type: "interrupt", interrupts: [...] }` → paused for human input.
     Client resumes by starting a new run with
     `RunAgentInput.resume = [{ interruptId, status, payload? }, …]`.

A `parentRunId` on `RUN_STARTED` creates a git-like branching log within the
same thread (time travel, alternative paths).

### Event categories

| Category                  | Events                                                                                                       |
| ------------------------- | ------------------------------------------------------------------------------------------------------------ |
| Lifecycle                 | `RUN_STARTED`, `RUN_FINISHED`, `RUN_ERROR`, `STEP_STARTED`, `STEP_FINISHED`                                  |
| Text message              | `TEXT_MESSAGE_START`, `TEXT_MESSAGE_CONTENT`, `TEXT_MESSAGE_END`, `TEXT_MESSAGE_CHUNK`                       |
| Tool call                 | `TOOL_CALL_START`, `TOOL_CALL_ARGS`, `TOOL_CALL_END`, `TOOL_CALL_RESULT`, `TOOL_CALL_CHUNK`                  |
| State                     | `STATE_SNAPSHOT`, `STATE_DELTA`, `MESSAGES_SNAPSHOT`                                                         |
| Activity (in-progress UI) | `ACTIVITY_SNAPSHOT`, `ACTIVITY_DELTA`                                                                        |
| Reasoning                 | `REASONING_START`, `REASONING_MESSAGE_START/CONTENT/END/CHUNK`, `REASONING_END`, `REASONING_ENCRYPTED_VALUE` |
| Special                   | `RAW`, `CUSTOM`                                                                                              |
| Draft                     | `META_EVENT`                                                                                                 |
| Deprecated (→ v1.0.0)     | `THINKING_*` (replaced by `REASONING_*`)                                                                     |

Two recurring patterns:

- **Start-Content-End** for streaming (text messages, tool calls, reasoning).
  `*_CHUNK` is a convenience event that auto-opens/closes the surrounding
  Start/End triad.
- **Snapshot-Delta** for state. Snapshots replace; deltas mutate via RFC 6902
  JSON Patch.

### Message roles

`user`, `assistant`, `system`, `tool`, `developer`, `activity`, `reasoning`.

- `user` content may be a plain string or an array of multimodal `InputContent`
  (text, image, audio, video, document — each with a `source` of `data` or
  `url`).
- `assistant` may carry `toolCalls` and optional `encryptedContent` for
  ZDR-style state continuity.
- `tool` carries `toolCallId` linking back to the originating tool call, plus
  optional `error`.
- `activity` is **frontend-only** — never forwarded to the agent. Use it for
  progress UI (`activityType: "PLAN" | "SEARCH" | …`, structured `content`).
- `reasoning` represents agent chain-of-thought. May be encrypted via
  `encryptedValue`; is round-tripped back to the agent on subsequent turns.

### State

- `STATE_SNAPSHOT { snapshot }` — replace the entire state.
- `STATE_DELTA { delta }` — apply an array of RFC 6902 JSON Patch operations
  (`add`, `remove`, `replace`, `move`, `copy`, `test`).
- `MESSAGES_SNAPSHOT { messages }` — replace the full message history.

The reference implementation uses `fast-json-patch`. On patch failure a client
may request a fresh snapshot. State must be emitted **before** a
`RUN_FINISHED` interrupt so resume is mode-agnostic (works for both replay-
style and checkpoint-style continuations).

### Tools

Tools are **defined by the frontend** and passed in `RunAgentInput.tools`. The
agent calls them via the `TOOL_CALL_*` event triad; the frontend executes and
returns a `tool`-role message with the matching `toolCallId`. CopilotKit
exposes this through React's `useCopilotAction` hook.

### Interrupts (human-in-the-loop)

An `Interrupt` carries `{ id, reason, message?, toolCallId?, responseSchema?,
expiresAt?, metadata? }`. Core `reason` values: `tool_call`, `input_required`,
`confirmation`. Frameworks namespace custom reasons as `<framework>:<name>`
(e.g. `langgraph:database_modification`).

Contract: a single `resume` array must address **every** open interrupt;
`RunAgentInput` on a thread with pending interrupts must include `resume` or
the agent emits `RUN_ERROR`. For tool-bound interrupts the agent does **not**
re-emit `TOOL_CALL_START/ARGS/END` after resume — it emits `TOOL_CALL_RESULT`
against the original `toolCallId`.

### Reasoning

`REASONING_*` events stream visible reasoning summaries; `REASONING_ENCRYPTED_VALUE`
attaches an opaque chain-of-thought blob (`subtype: "message" | "tool-call"`)
that the client stores and forwards back on subsequent turns without
decrypting. This is the ZDR / `store:false` story.

### Capabilities

Agents may expose `getCapabilities(): Promise<AgentCapabilities>` for
**discovery, not negotiation**. Ten typed sub-objects: `identity`, `transport`,
`tools`, `output`, `state`, `multiAgent`, `reasoning`, `multimodal`,
`execution`, `humanInTheLoop`, plus `custom`. Omitted = unknown, never assumed.

## Implementation paths

When implementing AG-UI, pick the role you're playing:

| Role           | When to use                                                                              | Key abstractions                                                                  |
| -------------- | ---------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| **Server**     | Building a new agent from scratch; want maximum control over emitted events              | FastAPI/Express endpoint, `EventEncoder`, emit events directly                    |
| **Middleware** | Adapting an existing framework or protocol (LangGraph, CrewAI, an internal SDK) to AG-UI | Extend `AbstractAgent`, translate framework events to AG-UI events inside `run()` |
| **Client**     | Building a UI (web, mobile, CLI) that talks to an AG-UI agent                            | `HttpAgent` or `AbstractAgent.subscribe`, handle the event stream                 |

Both server and middleware implementations expose the same HTTP contract:
POST `RunAgentInput`, return an SSE (or binary) stream of `BaseEvent` objects.

## SDKs at a glance

| Language                                        | Package(s)                                                       | Status      | Install                        |
| ----------------------------------------------- | ---------------------------------------------------------------- | ----------- | ------------------------------ |
| TypeScript / JavaScript                         | `@ag-ui/core`, `@ag-ui/client`, `@ag-ui/encoder`, `@ag-ui/proto` | 1st-party   | `npm install @ag-ui/client`    |
| Python                                          | `ag-ui-protocol` (`ag_ui.core`, `ag_ui.encoder`)                 | 1st-party   | `pip install ag-ui-protocol`   |
| Rust                                            | `ag-ui-client` crate                                             | Community   | `cargo add ag-ui-client`       |
| Java, Kotlin, Go, Dart, Ruby                    | various                                                          | Community   | see upstream `sdks/community/` |
| .NET, Nim, Flowise, Langflow, Cloudflare Agents | —                                                                | In progress | tracked as upstream issues     |

Quick start: `npx create-ag-ui-app@latest` scaffolds a project.

## Routing table — which reference file do I open?

There are 17 reference files in `references/`. Open the ones below based on the
question. Always prefer the most specific file.

### Concepts (`references/concepts/`)

| Question                                                                                                                        | File                              |
| ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| Full event schema, properties of every event type, draft/deprecated events                                                      | `concepts/events.md`              |
| Architecture overview, transport patterns, middleware layer                                                                     | `concepts/architecture.md`        |
| `AbstractAgent` shape, agent capabilities (high-level), agent lifecycle                                                         | `concepts/agents.md`              |
| Message schemas (User/Assistant/System/Tool/Activity/Developer/Reasoning), multimodal input, vendor-neutrality                  | `concepts/messages.md`            |
| `STATE_SNAPSHOT` vs `STATE_DELTA`, RFC 6902 JSON Patch examples, CopilotKit `useCoAgent`                                        | `concepts/state.md`               |
| Tool schema, frontend-defined tools, tool-call lifecycle, `useCopilotAction`                                                    | `concepts/tools.md`               |
| Interrupt-aware run lifecycle, `Interrupt` type, `resume` rules, tool-bound interrupts, approve-with-edits, parallel interrupts | `concepts/interrupts.md`          |
| Reasoning events, encrypted chain-of-thought, ZDR/store:false, migration from `THINKING_*`                                      | `concepts/reasoning.md`           |
| `AgentCapabilities` and all ten typed sub-objects                                                                               | `concepts/capabilities.md`        |
| Middleware pipeline mechanics (`use`, `MiddlewareFunction`, `Middleware` class), built-in `FilterToolCallsMiddleware`           | `concepts/middleware.md`          |
| Stream compaction, branching with `parentRunId`, normalized input                                                               | `concepts/serialization.md`       |
| Generative-UI specs (A2UI/Google, Open-JSON-UI/OpenAI, MCP-UI/Microsoft+Shopify); AG-UI is the runtime, not a gen-UI spec       | `concepts/generative-ui-specs.md` |

### Quickstart (`references/quickstart/`)

| Question                                                                       | File                       |
| ------------------------------------------------------------------------------ | -------------------------- |
| Building a Python/FastAPI AG-UI endpoint from scratch (OpenAI example)         | `quickstart/server.md`     |
| Building a JS/TS adapter that wraps an existing framework                      | `quickstart/middleware.md` |
| Building a client (CLI/web) that consumes AG-UI events; Mastra + tools example | `quickstart/client.md`     |

### SDKs (`references/sdks/`)

| Question                                                                                                                                                    | File                 |
| ----------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------- |
| TypeScript: `@ag-ui/client` (`AbstractAgent`, `HttpAgent`, middleware, `AgentSubscriber`), `@ag-ui/core` types and events, `@ag-ui/encoder`, `@ag-ui/proto` | `sdks/typescript.md` |
| Python: `ag_ui.core` types/events, `ag_ui.encoder.EventEncoder`, FastAPI/SSE patterns, multimodal input                                                     | `sdks/python.md`     |
| Rust, Java, Kotlin, Go, Dart, Ruby — install hints and pointers into the upstream repo                                                                      | `sdks/others.md`     |

### Integrations (`references/`)

| Question                                                                                                                                                                                                                                                              | File              |
| --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Which agent frameworks support AG-UI (LangGraph, CrewAI, Mastra, Microsoft Agent Framework, Google ADK, AWS Strands, Bedrock AgentCore, Pydantic AI, Agno, LlamaIndex, AG2), which clients (CopilotKit), which related specs (A2A, MCP Apps, A2UI, Oracle Agent Spec) | `integrations.md` |

## Source

All references in this skill are distilled from the upstream AG-UI documentation
at `submodules/ag-ui/docs/` (102 MDX files, snapshotted at the submodule's
current commit). When the user needs the absolute latest text — release notes,
draft specs, brand-new integrations — check the submodule directly or
[github.com/ag-ui-protocol/ag-ui](https://github.com/ag-ui-protocol/ag-ui).
Each reference file cites its upstream path at the top so you can verify or
expand from there.
