# Quickstart: Client implementation

Source: `submodules/ag-ui/docs/quickstart/clients.mdx`

How to **consume AG-UI events** in a user-facing app. Open this file when
building a CLI, web, or mobile client that talks to an AG-UI-compatible
agent. The walkthrough below uses Mastra; the pattern is the same for any
agent implementation.

## When to build your own client

For most production cases, use a full-featured client like
[CopilotKit](https://copilotkit.ai). Building your own client is useful when
you want to:

- Explore or hack on the AG-UI protocol directly.
- Build a CLI/terminal/mobile experience CopilotKit doesn't cover.
- Tightly integrate AG-UI into a custom UI framework.

## What the example builds

A Node.js/TypeScript CLI that:

1. Wraps a Mastra agent via `MastraAgent` from `@ag-ui/mastra`.
2. Uses OpenAI's GPT-4o.
3. Streams responses to the terminal.
4. Adds tools (weather, browser) and shows tool-call events.

## Project setup

```bash
mkdir my-ag-ui-client && cd my-ag-ui-client
pnpm init
pnpm add -D typescript @types/node tsx
```

Minimal `tsconfig.json`:

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

Scripts:

```json
{
  "scripts": {
    "start": "tsx src/index.ts",
    "dev":   "tsx --watch src/index.ts",
    "build": "tsc"
  }
}
```

## Install dependencies

```bash
pnpm add @ag-ui/client @ag-ui/core @ag-ui/mastra
pnpm add @mastra/core @mastra/client-js @mastra/memory @mastra/libsql
pnpm add zod
```

## Define the agent (`src/agent.ts`)

```typescript
import { Agent } from "@mastra/core/agent"
import { MastraAgent } from "@ag-ui/mastra"
import { Memory } from "@mastra/memory"
import { LibSQLStore } from "@mastra/libsql"

export const agent = new MastraAgent({
  resourceId: "cliExample",
  agent: new Agent({
    id: "ag-ui-assistant",
    name: "AG-UI Assistant",
    instructions: `
      You are a helpful AI assistant. Be friendly, conversational, and helpful.
    `,
    model: "openai/gpt-4o",
    memory: new Memory({
      storage: new LibSQLStore({ id: "storage-memory", url: "file:./assistant.db" }),
    }),
  }),
  threadId: "main-conversation",
})
```

`MastraAgent` is the AG-UI adapter for Mastra — it implements `AbstractAgent`
and wires Mastra's event stream into AG-UI events.

## CLI interface (`src/index.ts`)

```typescript
import * as readline from "readline"
import { randomUUID } from "@ag-ui/client"
import { agent } from "./agent"

const rl = readline.createInterface({ input: process.stdin, output: process.stdout })

async function chatLoop() {
  console.log("AG-UI Assistant started!")
  console.log("Type a message and press Enter. Ctrl+D to quit.\n")

  return new Promise<void>((resolve) => {
    const promptUser = () => {
      rl.question("> ", async (input) => {
        if (!input.trim()) return promptUser()
        console.log("")
        rl.pause()

        agent.messages.push({ id: randomUUID(), role: "user", content: input.trim() })

        try {
          await agent.runAgent(
            {},  // no extra runAgent params
            {
              onTextMessageStartEvent()                   { process.stdout.write("Assistant: ") },
              onTextMessageContentEvent({ event })        { process.stdout.write(event.delta) },
              onTextMessageEndEvent()                     { console.log("\n") },
            }
          )
        } catch (error) {
          console.error("Error:", error)
        }

        rl.resume()
        promptUser()
      })
    }

    rl.on("close", () => { console.log("\nBye!"); resolve() })
    promptUser()
  })
}

chatLoop().catch(console.error)
```

The handler object you pass as the second argument to `runAgent` is an
`AgentSubscriber` — it's how you observe AG-UI events. See `concepts/agents.md`
and `references/sdks/typescript.md` for the full event handler list.

## Adding tools

Create `src/tools/weather.tool.ts`:

```typescript
import { createTool } from "@mastra/core/tools"
import { z } from "zod"

export const weatherTool = createTool({
  id: "get-weather",
  description: "Get current weather for a location",
  inputSchema:  z.object({ location: z.string().describe("City name") }),
  outputSchema: z.object({
    temperature: z.number(),
    feelsLike: z.number(),
    humidity: z.number(),
    windSpeed: z.number(),
    windGust: z.number(),
    conditions: z.string(),
    location: z.string(),
  }),
  execute: async ({ location }) => fetchWeather(location),
})
```

Register on the agent:

```typescript
import { weatherTool } from "./tools/weather.tool"

export const agent = new MastraAgent({
  agent: new Agent({
    // ... existing config
    tools: { weatherTool },
  }),
  threadId: "main-conversation",
})
```

Listen for tool events in the CLI:

```typescript
await agent.runAgent({}, {
  // ... existing handlers
  onToolCallStartEvent({ event })  { console.log("Tool call:", event.toolCallName) },
  onToolCallArgsEvent({ event })   { process.stdout.write(event.delta) },
  onToolCallEndEvent()             { console.log("") },
  onToolCallResultEvent({ event }) { if (event.content) console.log("Result:", event.content) },
})
```

## What event flow you're handling

1. **User input** captured by readline.
2. **Message added** to `agent.messages` (the shared history).
3. **Agent run** triggers a `RunStartedEvent` → streamed content events →
   `RunFinishedEvent`.
4. **Streaming display** via the subscriber callbacks above.

Mapping subscriber method ↔ event:

| Subscriber method | Underlying event |
| --- | --- |
| `onRunStartedEvent` | `RUN_STARTED` |
| `onRunFinishedEvent` / `onRunErrorEvent` | terminal events |
| `onTextMessageStartEvent` / `ContentEvent` / `EndEvent` | `TEXT_MESSAGE_*` triad |
| `onToolCallStartEvent` / `ArgsEvent` / `EndEvent` / `ResultEvent` | `TOOL_CALL_*` triad + result |
| `onStateSnapshotEvent` / `onStateDeltaEvent` | shared state changes |
| `onReasoningStartEvent` / `ReasoningEndEvent` etc. | `REASONING_*` events |

You can also subscribe to `agent.events$` (an RxJS observable) for the raw
typed `BaseEvent` stream — useful when you want to switch on `event.type`
directly.

## Deploying / globalizing the CLI

```bash
pnpm build
chmod +x dist/index.js
# add a shebang in dist/index.js: #!/usr/bin/env node
pnpm link --global
```

## Extension ideas

- Calculator, file system, database, or API tools (same `createTool` pattern).
- Use `chalk` for color output; `ora` for spinners.
- Persist conversation history (replay `MESSAGES_SNAPSHOT` on startup).
- Cache expensive tool results.

## See also

- `concepts/agents.md` — `AbstractAgent` lifecycle
- `concepts/events.md` — every event the agent can emit
- `concepts/tools.md` — frontend-defined tool round-trip
- `references/sdks/typescript.md` — `@ag-ui/client` API including
  `AgentSubscriber`
