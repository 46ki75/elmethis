import { CopilotRuntime, InMemoryAgentRunner } from "@copilotkit/runtime/v2";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const generateAgent = (
  modelId: string,
  reasoningEffort: "low" | "medium" | "high",
): BuiltInAgent =>
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
        reasoning: { effort: "low" },
      },
    },
    tools: [],
  });

export const copilotkitBuiltinRuntime = new CopilotRuntime({
  agents: {
    "gpt-5.4-nano": generateAgent("openai/gpt-5.4-nano", "high"),
    "minimax-m2.5": generateAgent("minimax/minimax-m2.5", "high"),
    "minimax-m2.5-free": generateAgent("minimax/minimax-m2.5:free", "high"),
    "kimi-k2.6": generateAgent("moonshotai/kimi-k2.6", "high"),
  },
  runner: new InMemoryAgentRunner(),
  a2ui: {
    injectA2UITool: true,
  },
});

export const wordleRuntime = new CopilotRuntime({
  agents: {
    default: generateAgent("openai/gpt-5.4-nano:nitro", "low"),
  },
  runner: new InMemoryAgentRunner(),
});
