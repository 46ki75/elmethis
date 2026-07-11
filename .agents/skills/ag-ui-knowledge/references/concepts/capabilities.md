# Capabilities

Source: `submodules/ag-ui/docs/concepts/capabilities.mdx`

Dynamic capability discovery. Open this file to look up the typed sub-objects
on `AgentCapabilities` or to remember the discovery-not-negotiation contract.

## How discovery works

`AbstractAgent` exposes an optional `getCapabilities(): Promise<AgentCapabilities>`
that returns a live typed snapshot of what the agent supports.

```typescript
const agent = new HttpAgent({ url: "https://my-agent.example.com/api" })
const capabilities = await agent.getCapabilities?.()

if (capabilities?.tools?.supported) {
  console.log(`Agent provides ${capabilities.tools.items?.length} tools`)
}

if (capabilities?.reasoning?.supported) {
  showReasoningPanel()
}
```

### Contract

- **Discovery only** — the agent declares; there is no negotiation.
- **Dynamic** — reflects current state (e.g. tools registered after the agent
  was created appear on the next call).
- **Optional** — agents that don't implement it return `undefined`.
- **Absent = unknown** — only declare what you support; omitted fields mean
  the capability is undeclared, not "not supported".

## The `AgentCapabilities` interface

```typescript
interface AgentCapabilities {
  identity?:       IdentityCapabilities
  transport?:      TransportCapabilities
  tools?:          ToolsCapabilities
  output?:         OutputCapabilities
  state?:          StateCapabilities
  multiAgent?:     MultiAgentCapabilities
  reasoning?:      ReasoningCapabilities
  multimodal?:     MultimodalCapabilities
  execution?:      ExecutionCapabilities
  humanInTheLoop?: HumanInTheLoopCapabilities
  custom?:         Record<string, unknown>  // escape hatch
}
```

## Sub-object reference

### `identity`

| Field | Notes |
| --- | --- |
| `name?` | Display name |
| `type?` | Framework/platform (`"langgraph"`, `"mastra"`, `"crewai"`) |
| `description?` | What this agent does — helps users and routing pick |
| `version?` | Semver of the agent |
| `provider?` | Maintaining org or team |
| `documentationUrl?` | Docs/homepage URL |
| `metadata?` | Free-form key/value |

### `transport`

Set `true` only for transports you actually support.

| Field | Meaning |
| --- | --- |
| `streaming?` | Streams responses via SSE |
| `websocket?` | Accepts persistent WebSocket connections |
| `httpBinary?` | Supports the AG-UI binary protocol (protobuf over HTTP) |
| `pushNotifications?` | Can send async updates via webhooks after a run finishes |
| `resumable?` | Supports resuming interrupted streams via sequence numbers |

### `tools`

| Field | Meaning |
| --- | --- |
| `supported?` | Whether the agent can make tool calls at all |
| `items?` | Tools this agent provides (full JSON Schema), distinct from client-provided tools in `RunAgentInput.tools` |
| `parallelCalls?` | Can invoke multiple tools concurrently within a single step |
| `clientProvided?` | Accepts and uses client-provided tools at runtime |

### `output`

| Field | Meaning |
| --- | --- |
| `structuredOutput?` | Can produce structured JSON conforming to a schema |
| `supportedMimeTypes?` | MIME types the agent can produce |

### `state`

| Field | Meaning |
| --- | --- |
| `snapshots?` | Emits `STATE_SNAPSHOT` events |
| `deltas?` | Emits `STATE_DELTA` events |
| `memory?` | Has long-term memory beyond the current thread |
| `persistentState?` | State preserved across multiple runs within the same thread |

### `multiAgent`

| Field | Meaning |
| --- | --- |
| `supported?` | Participates in any multi-agent coordination |
| `delegation?` | Can delegate subtasks while retaining control |
| `handoffs?` | Can transfer the conversation entirely to another agent |
| `subAgents?` | `Array<{ name: string; description?: string }>` |

### `reasoning`

| Field | Meaning |
| --- | --- |
| `supported?` | Produces visible reasoning tokens |
| `streaming?` | Reasoning streamed incrementally vs. returned all at once |
| `encrypted?` | Reasoning content is encrypted (ZDR mode); expect opaque `encryptedValue` |

### `multimodal`

```typescript
interface MultimodalCapabilities {
  input?:  { image?: boolean; audio?: boolean; video?: boolean; pdf?: boolean; file?: boolean }
  output?: { image?: boolean; audio?: boolean }
}
```

Drives UI affordances (file pickers, audio recorders, image uploads).

### `execution`

| Field | Meaning |
| --- | --- |
| `codeExecution?` | Can execute code during a run |
| `sandboxed?` | Code execution is sandboxed (only meaningful with `codeExecution`) |
| `maxIterations?` | Max tool-call / reasoning iterations per run |
| `maxExecutionTime?` | Max wall-clock time per run (ms) |

### `humanInTheLoop`

| Field | Meaning |
| --- | --- |
| `supported?` | Any HITL interaction |
| `approvals?` | Can pause for explicit approval (e.g. sending emails) |
| `interventions?` | Allows humans to modify the plan mid-execution |
| `feedback?` | Incorporates thumbs up/down / corrections in-session |
| `interrupts?` | Participates in the AG-UI interrupt protocol (`RunFinished` + `outcome.interrupts`, `RunAgentInput.resume`) |
| `approveWithEdits?` | Tool-call interrupts accept `editedArgs` in resume payload (only meaningful with `interrupts`) |

See `interrupts.md` for the full interrupt protocol.

### `custom`

Escape hatch for integration-specific capabilities not covered by the
standard categories.

```typescript
const capabilities = await agent.getCapabilities?.()
const rateLimit = capabilities?.custom?.rateLimit as { maxRequestsPerMinute: number } | undefined
if (rateLimit) configureThrottling(rateLimit.maxRequestsPerMinute)
```

## Implementing `getCapabilities()`

```typescript
import { AbstractAgent, AgentCapabilities } from "@ag-ui/client"

class MyAgent extends AbstractAgent {
  async getCapabilities(): Promise<AgentCapabilities> {
    return {
      identity:  { name: "my-agent", description: "Custom agent with tool support", version: "1.0.0" },
      transport: { streaming: true },
      tools:     { supported: true, items: this.getRegisteredTools(), clientProvided: true },
      state:     { snapshots: true, deltas: true },
    }
  }
}
```

Capabilities are a live snapshot — register a new tool, the next
`getCapabilities()` call reflects it.

## Client usage patterns

### Adaptive UI

```typescript
const capabilities = await agent.getCapabilities?.()
if (capabilities?.reasoning?.supported)        showReasoningPanel()
if (capabilities?.multiAgent?.subAgents?.length) showSubAgentSelector(capabilities.multiAgent.subAgents)
if (capabilities?.humanInTheLoop?.approvals)   enableApprovalWorkflow()
```

### Feature gating

```typescript
const canUseStructuredOutput = capabilities?.output?.structuredOutput ?? false
const canStream             = capabilities?.transport?.streaming ?? false
```

## See also

- `agents.md` — where `getCapabilities()` lives on `AbstractAgent`
- `interrupts.md` — `humanInTheLoop.interrupts` and `approveWithEdits` semantics
- `events.md` — events governed by the transport/state/reasoning categories
