import { CopilotRuntime, InMemoryAgentRunner } from "@copilotkit/runtime/v2";
import { ClaudeAgentAdapter } from "@ag-ui/claude-agent-sdk";
import type { AgentDefinition } from "@anthropic-ai/claude-agent-sdk";
import type { AbstractAgent } from "@ag-ui/client";

// Work around an upstream bug in @ag-ui/claude-agent-sdk@0.0.3: its `clone()`
// copies `config`/`headers` but not the `sessions`/`activeQueries` Maps that the
// constructor initializes (the base `AbstractAgent.clone()` uses `Object.create`,
// so the subclass constructor never runs). CopilotKit's `InMemoryAgentRunner`
// clones the agent per request, so the clone's `run()` would throw
// "Cannot read properties of undefined (reading 'get')" on `this.sessions.get()`.
//
// We re-initialize both Maps on the clone. `sessions` is shared with the source
// agent so Claude session-resume (multi-turn continuity) survives across the
// per-request clones; `activeQueries` is per-run, so it starts fresh.
class SessionSafeClaudeAgentAdapter extends ClaudeAgentAdapter {
  clone(): ClaudeAgentAdapter {
    const cloned = super.clone();
    const self = this as unknown as { sessions: Map<string, unknown> };
    const target = cloned as unknown as {
      sessions: Map<string, unknown>;
      activeQueries: Map<string, unknown>;
    };
    target.sessions = self.sessions;
    target.activeQueries = new Map();
    return cloned;
  }
}

// AWS Knowledge MCP server — lets the assistant answer questions about AWS
// features/services (the story's "Ask about AWS" prompt). Allowed explicitly
// below; the adapter auto-allows the frontend-provided `ag_ui` tools, but
// backend MCP servers must be opted into via `allowedTools`.
const AWS_KNOWLEDGE_MCP_URL = "https://knowledge-mcp.global.api.aws";

const SYSTEM_PROMPT = "You are a helpful assistant!";

// The Claude Agent SDK ships the full Claude Code tool belt (shell, file
// read/write, …). For this chat test-harness we want the LLM, our MCP tools,
// and the `Agent` tool (to spawn the backend subagents in `AGENTS`), so block
// the local-machine tools — the assistant should never touch the dev's
// filesystem or shell. NOTE: `disallowedTools` is a global deny, so it also
// constrains the subagents — they inherit this same no-filesystem sandbox.
const DISALLOWED_TOOLS = [
  "Bash",
  "BashOutput",
  "KillShell",
  "Read",
  "Write",
  "Edit",
  "NotebookEdit",
  "Glob",
  "Grep",
  "TodoWrite",
];

// Backend subagents the assistant can spawn via the `Agent` tool. Each inherits
// `DISALLOWED_TOOLS` (a global deny), so its `tools` allow-list can only widen
// within what survives that deny — here, the AWS Knowledge MCP plus web access.
const AGENTS: Record<string, AgentDefinition> = {
  "web-search-agent": {
    description:
      "Researches a question on the public web. Delegate any question that " +
      "needs up-to-date or general-knowledge information to it.",
    prompt:
      "You research questions using the public web. Use WebSearch to find " +
      "relevant sources and WebFetch to read them, then report a concise, " +
      "cited summary back to the main assistant. For AWS-specific questions, " +
      "prefer the AWS Knowledge MCP tools.",
    tools: ["WebSearch", "WebFetch", "mcp__aws-knowledge"],
  },
};

// Authentication is via the ANTHROPIC_API_KEY environment variable, read by
// the underlying Claude Agent SDK (`query()` spawns a CLI child process). The
// adapter itself does not manage API keys.
const generateAgent = (
  agentId: string,
  model: string,
  description: string,
): AbstractAgent =>
  new SessionSafeClaudeAgentAdapter({
    agentId,
    description,
    model,
    systemPrompt: SYSTEM_PROMPT,
    // Isolation mode: do not load the dev machine's `~/.claude` / project
    // settings, so the agent does not inherit the developer's personal MCP
    // servers, plugins, or skills. Only the servers configured below are used.
    settingSources: [],
    mcpServers: {
      "aws-knowledge": {
        type: "http",
        url: AWS_KNOWLEDGE_MCP_URL,
      },
    },
    // Backend subagents the assistant can delegate to via the `Agent` tool.
    agents: AGENTS,
    // Permit the AWS Knowledge MCP server's tools and the `Agent` tool (so the
    // assistant can spawn the subagents in `AGENTS`). Frontend tools delivered
    // via `RunAgentInput.tools` are wired up by the adapter automatically.
    allowedTools: ["mcp__aws-knowledge", "Agent", "WebFetch", "WebSearch"],
    disallowedTools: DISALLOWED_TOOLS,
    // The adapter and @copilotkit/runtime each resolve `@ag-ui/client` through
    // their own pnpm peer-dependency context, so TypeScript treats their
    // `AbstractAgent` declarations as distinct even though Node resolves both to
    // the single @ag-ui/client@0.0.57 class at runtime (verified: the runtime
    // accepts and runs these agents). Cast to bridge the cosmetic type-identity
    // gap.
  }) as unknown as AbstractAgent;

// `/copilotkit/claude/agent/opus/run`
// `/copilotkit/claude/agent/sonnet/run`
// `/copilotkit/claude/agent/haiku/run`
export const copilotkitClaudeRuntime = new CopilotRuntime({
  agents: {
    opus: generateAgent("opus", "claude-opus-4-8", "Claude Opus 4.8"),
    sonnet: generateAgent("sonnet", "claude-sonnet-4-6", "Claude Sonnet 4.6"),
    haiku: generateAgent("haiku", "claude-haiku-4-5", "Claude Haiku 4.5"),
  },
  runner: new InMemoryAgentRunner(),
  a2ui: {
    injectA2UITool: true,
  },
});

// `/copilotkit/wordle/agent/default/run`
export const wordleRuntime = new CopilotRuntime({
  agents: {
    default: generateAgent("default", "claude-haiku-4-5", "Claude Haiku 4.5"),
  },
  runner: new InMemoryAgentRunner(),
});
