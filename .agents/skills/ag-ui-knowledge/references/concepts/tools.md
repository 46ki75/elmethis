# Tools

Source: `submodules/ag-ui/docs/concepts/tools.mdx`

How tools work in AG-UI and the rationale for the frontend-defined model. Open
this file when defining tool schemas, implementing the tool-call round-trip,
or designing human-in-the-loop confirmation flows.

## Why tools matter

Tools let agents:

1. Request specific information.
2. Perform actions in external systems.
3. Ask for human input or confirmation.
4. Access specialized capabilities.

They're the bridge between agent reasoning and real-world effects.

## Schema

```typescript
interface Tool {
  name: string
  description: string
  parameters: {
    type: "object"
    properties: { /* tool-specific */ }
    required: string[]
  }
}
```

`parameters` is JSON Schema (<https://json-schema.org/>). Both the agent (when
generating valid calls) and the frontend (when validating before execution)
rely on it.

## Frontend-defined tools

In AG-UI, **tools are defined in the frontend and passed to the agent at
run-time** via `RunAgentInput.tools`:

```typescript
const userConfirmationTool = {
  name: "confirmAction",
  description: "Ask the user to confirm a specific action before proceeding",
  parameters: {
    type: "object",
    properties: {
      action: { type: "string", description: "The action that needs confirmation" },
      importance: {
        type: "string",
        enum: ["low", "medium", "high", "critical"],
        description: "Importance level",
      },
    },
    required: ["action"],
  },
}

agent.runAgent({ tools: [userConfirmationTool] })
```

This inversion-of-control matters because:

| Benefit | What it buys you |
| --- | --- |
| **Frontend control** | The UI decides what capabilities are available — even per user, per session. |
| **Dynamic capabilities** | Add/remove tools based on permissions, context, feature flags. |
| **Separation of concerns** | Agents focus on reasoning; frontends own tool execution. |
| **Security** | Sensitive operations live in the app, not the model. |

## Tool-call lifecycle

The agent emits a streaming triad of events when invoking a tool:

```text
ToolCallStart → ToolCallArgs* → ToolCallEnd
```

```typescript
{ type: EventType.TOOL_CALL_START,
  toolCallId: "tool-123",
  toolCallName: "confirmAction",
  parentMessageId: "msg-456" }

{ type: EventType.TOOL_CALL_ARGS, toolCallId: "tool-123", delta: '{"act'      }
{ type: EventType.TOOL_CALL_ARGS, toolCallId: "tool-123", delta: 'ion":"Depl' }
{ type: EventType.TOOL_CALL_ARGS, toolCallId: "tool-123", delta: 'oy"}'        }

{ type: EventType.TOOL_CALL_END, toolCallId: "tool-123" }
```

Concatenate the `delta` chunks in order to get the full JSON-encoded arguments.

The convenience `TOOL_CALL_CHUNK` event collapses this into auto-managed
chunks (first chunk must include `toolCallId` + `toolCallName`).

## Returning tool results

After execution, the frontend posts a `tool`-role message into the next
`RunAgentInput`:

```typescript
{
  id: "result-789",
  role: "tool",
  content: "true",            // result as string
  toolCallId: "tool-123",     // references the originating tool call
}
```

This becomes part of the conversation history; the agent references it in
subsequent reasoning.

## Human-in-the-loop pattern

The classic flow:

1. Agent needs an important decision.
2. Agent calls `confirmAction` with details.
3. Frontend shows a confirmation dialog.
4. User responds.
5. Frontend returns the decision as a `tool` message.
6. Agent continues, aware of the user's choice.

Variants enabled by this pattern: approval workflows, data verification,
collaborative decision-making, supervised learning loops. For richer flows
with edit-before-approve and parallel decisions, use the interrupt protocol
(see `interrupts.md`) — it complements tools rather than replacing them.

## CopilotKit integration

`useCopilotAction` is the React-side ergonomic wrapper:

```tsx
useCopilotAction({
  name: "confirmAction",
  description: "Ask the user to confirm an action",
  parameters: {
    type: "object",
    properties: { action: { type: "string", description: "The action to confirm" } },
    required: ["action"],
  },
  handler: async ({ action }) => {
    const confirmed = await showConfirmDialog(action)
    return confirmed ? "approved" : "rejected"
  },
})
```

## Common tool shapes

### Confirmation

```typescript
{
  name: "confirmAction",
  description: "Ask the user to confirm an action",
  parameters: {
    type: "object",
    properties: {
      action: { type: "string", description: "The action to confirm" },
      importance: { type: "string", enum: ["low", "medium", "high", "critical"] },
    },
    required: ["action"],
  },
}
```

### Data retrieval

```typescript
{
  name: "fetchUserData",
  description: "Retrieve data about a specific user",
  parameters: {
    type: "object",
    properties: {
      userId: { type: "string" },
      fields: { type: "array", items: { type: "string" } },
    },
    required: ["userId"],
  },
}
```

### UI control

```typescript
{
  name: "navigateTo",
  description: "Navigate to a different page or view",
  parameters: {
    type: "object",
    properties: {
      destination: { type: "string" },
      params: { type: "object" },
    },
    required: ["destination"],
  },
}
```

### Content generation

```typescript
{
  name: "generateImage",
  description: "Generate an image based on a description",
  parameters: {
    type: "object",
    properties: {
      prompt: { type: "string" },
      style: { type: "string" },
      dimensions: { type: "object", properties: { width: { type: "number" }, height: { type: "number" } } },
    },
    required: ["prompt"],
  },
}
```

## Design tips

- **Action-oriented names** — `confirmAction`, `fetchUserData`, `navigateTo`.
- **Thorough descriptions** — the agent picks tools based on these; don't be
  terse.
- **Precise schemas** — use `enum`, `format`, descriptions, and minimal
  `required`.
- **Robust error handling in the executor** — return informative messages so
  the agent can self-correct.
- **Design the UI around the tool** — when a tool is a human gate, the user
  must have enough context to decide well.

## See also

- `events.md` — `TOOL_CALL_*` event field tables
- `messages.md` — how `ToolCall` and `ToolMessage` fit into history
- `interrupts.md` — richer human-gate flow when tools aren't enough
