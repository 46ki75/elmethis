import { CopilotRuntime, InMemoryAgentRunner } from "@copilotkit/runtime/v2";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const generateAgent = (modelId: string): BuiltInAgent =>
  new BuiltInAgent({
    model: openrouter(modelId),
    maxSteps: 200,
    mcpServers: [
      {
        url: "https://knowledge-mcp.global.api.aws",
        type: "http",
        options: {},
      },
    ],
    providerOptions: {
      openrouter: {
        reasoning: { effort: "high" },
      },
    },
    tools: [],
  });

export const copilotkitBuiltinRuntime = new CopilotRuntime({
  agents: {
    "gpt-5.4-nano": generateAgent("openai/gpt-5.4-nano"),
    "minimax-m2.5": generateAgent("minimax/minimax-m2.5"),
    "minimax-m2.5-free": generateAgent("minimax/minimax-m2.5:free"),
    "kimi-k2.6": generateAgent("moonshotai/kimi-k2.6"),
  },
  runner: new InMemoryAgentRunner(),
  a2ui: {
    injectA2UITool: true,
  },
});
