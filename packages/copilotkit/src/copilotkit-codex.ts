import { CopilotRuntime, InMemoryAgentRunner } from "@copilotkit/runtime/v2";
import { CodexAgentAdapter } from "./codex-agent.ts";

const generateAgent = () =>
  new CodexAgentAdapter({
    agentId: "default",
    description: "Codex (Sign in with ChatGPT plan)",
    // Omission selects the first visible model in the active SIWC account's
    // ordered catalog, not Codex's bundled catalog or a hard-coded default.
    model: process.env.CODEX_MODEL || undefined,
  });

// `/copilotkit/codex/agent/default/run`
export const copilotkitCodexRuntime = new CopilotRuntime({
  agents: { default: generateAgent() },
  runner: new InMemoryAgentRunner(),
  a2ui: { injectA2UITool: true },
});

// Keep the Wordle route stable; it does not inject the A2UI tool.
export const wordleRuntime = new CopilotRuntime({
  agents: { default: generateAgent() },
  runner: new InMemoryAgentRunner(),
});
