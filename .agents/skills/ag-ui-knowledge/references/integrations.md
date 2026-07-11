# Integrations

Source: `submodules/ag-ui/docs/integrations.mdx` and
`submodules/ag-ui/docs/introduction.mdx`

The AG-UI ecosystem: frontends, agent frameworks, deployment platforms, and
sister specs. Open this file when someone asks "does AG-UI support X?",
"how do I integrate with X?", or "what client should I use?".

## Frontends (clients)

| Client | Status | Notes |
| --- | --- | --- |
| **CopilotKit** | 1st-party | The reference React client. Exposes `useCopilotAction` (tools), `useCoAgent` (shared state), and pre-built chat UI. The recommended client for most production apps. |
| **Terminal + Agent** | Community | The CLI client walkthrough in `quickstart/client.md`. Good template for custom clients. |
| React Native | Help wanted | Tracked as upstream issue #510 |

## Agent frameworks

### Partnerships (AG-UI was born from these)

| Framework | Status | Docs |
| --- | --- | --- |
| **LangGraph** | Supported | `docs.copilotkit.ai/langgraph/` |
| **CrewAI** | Supported | `docs.copilotkit.ai/crewai-flows` |

### 1st-party (built-in support)

| Framework | Status | Notes |
| --- | --- | --- |
| **Microsoft Agent Framework** | Supported | Python + .NET |
| **Google ADK** | Supported | Gemini-focused |
| **AWS Strands Agents** | Supported | Model-driven Python SDK |
| **AWS Bedrock AgentCore** | Supported | Managed deployment platform (see below) |
| **Mastra** | Supported | TypeScript agent framework |
| **Pydantic AI** | Supported | Production-ready Python agents |
| **Agno** | Supported | Multi-agent systems framework |
| **LlamaIndex** | Supported | RAG-focused; data framework for LLM apps |
| **AG2** | Supported | Open-source AgentOS |
| AWS Bedrock Agents | In progress | — |

### Community

| Framework | Status |
| --- | --- |
| Claude Agent SDK | Listed on partner site |
| Langroid | Listed |
| OpenAI Agent SDK | In progress |
| Cloudflare Agents | In progress |

### Integration pattern

Each framework integration provides:

1. An `AbstractAgent` subclass (TypeScript or equivalent) that translates the
   framework's native event stream into AG-UI events.
2. Often, a server-side companion (Python) that emits AG-UI events from
   within the framework's run loop.
3. Examples in the upstream `apps/dojo/` showcasing agentic chat,
   generative UI, human-in-the-loop, shared state, and tool-based UI.

See `quickstart/middleware.md` for the pattern when you need to build a
similar adapter for a framework not yet covered.

## Infrastructure / deployment

| Platform | Status | Notes |
| --- | --- | --- |
| **Amazon Bedrock AgentCore** | Supported, 1st-party | Fully managed infrastructure for deploying AG-UI agents with native protocol support, managed authentication, session isolation, and auto-scaling. See `aws.amazon.com/bedrock/agentcore/`. |

For self-hosted deployments, the protocol is just HTTP + SSE (or binary), so
any container / serverless platform works. The dojo (`apps/dojo/`) is a
Next.js app that can be deployed standalone.

## Specifications and sister protocols

AG-UI is one of three open agentic protocols, each at a different layer:

| Layer | Protocol | Origin |
| --- | --- | --- |
| Agent ↔ Tools / Data | **MCP** (Model Context Protocol) | Anthropic |
| Agent ↔ Agent | **A2A** (Agent to Agent) | Google |
| **Agent ↔ User** | **AG-UI** | CopilotKit + LangGraph + CrewAI |

A single agent often uses all three simultaneously.

### Handshakes with sister protocols

| Spec | Status |
| --- | --- |
| **A2A Middleware** | Supported partnership — AG-UI can front for A2A-served agents |

### Generative UI specs

AG-UI is **not itself a generative-UI spec**. It is the bidirectional
event/runtime protocol that provides the two-way connection between the agent
and the application, and it **natively supports all three** generative-UI specs
below (plus custom ones). Generative-UI specs define *how* UI components are
structured and transmitted; AG-UI provides the runtime that carries them.

| Spec | Author(s) | Notes |
| --- | --- | --- |
| **A2UI** | Google | Declarative, LLM-friendly generative-UI spec — JSONL-based, streaming, platform-agnostic rendering |
| **Open-JSON-UI** | OpenAI | Open standardization of OpenAI's internal declarative generative-UI schema |
| **MCP-UI** | Microsoft + Shopify | Fully open, iframe-based generative-UI standard that extends MCP for user-facing experiences |

Don't confuse **A2UI** (a generative-UI widget spec) with **AG-UI** (the
Agent ↔ User interaction protocol) — different scopes, complementary roles.
See `concepts/generative-ui-specs.md` for the full breakdown.

### Other standards

| Spec | Status |
| --- | --- |
| **Oracle Open Agent Spec** | Supported — portable language for defining agentic systems |

## SDKs (covered separately)

See `sdks/typescript.md`, `sdks/python.md`, and `sdks/others.md` for the
language coverage matrix.

## Where to get help / engage

- **GitHub**: [github.com/ag-ui-protocol/ag-ui](https://github.com/ag-ui-protocol/ag-ui)
  for issues, PRs, and discussions.
- **Discord**: [discord.gg/Jd3FzfdJa8](https://discord.gg/Jd3FzfdJa8) for
  community chat.
- **Dojo**: [dojo.ag-ui.com](https://dojo.ag-ui.com/) for live demos of every
  feature with every supported framework.

## When picking an integration

| Situation | Recommendation |
| --- | --- |
| Building a React app, want fastest path to a working chat UI | CopilotKit + your choice of agent framework |
| Already using LangGraph / CrewAI / Mastra | The 1st-party integration for that framework — they provide the AbstractAgent subclass |
| Building a new agent from scratch in Python | Server path (`quickstart/server.md`); FastAPI + `ag_ui.encoder` |
| Building a custom non-React client | Client path (`quickstart/client.md`); the SDK exposes RxJS streams |
| Deploying to AWS without managing infra | Bedrock AgentCore |
| Need to coordinate multiple agents | LangGraph or AG2; emit AG-UI events from the orchestrator |

## See also

- `quickstart/server.md` — when you need to build a new server
- `quickstart/middleware.md` — when you're adapting a framework
- `quickstart/client.md` — when you're consuming events
- `concepts/capabilities.md` — how agents advertise what they support
