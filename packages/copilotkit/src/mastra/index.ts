import { Agent } from "@mastra/core/agent";
import { MCPClient } from "@mastra/mcp";
import { Mastra } from "@mastra/core";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const mcp = new MCPClient({
  id: "aws-knowledge",
  servers: {
    awsKnowledge: {
      url: new URL("https://knowledge-mcp.global.api.aws"),
    },
  },
});

const mcpTools = await mcp.listTools();

const generateAgent = (id: string, modelId: string): Agent =>
  new Agent({
    id,
    name: id,
    instructions: "You are a helpful assistant.",
    model: openrouter(modelId),
    tools: mcpTools,
  });

export const mastra = new Mastra({
  agents: {
    "gpt-5.4-nano": generateAgent("gpt-5.4-nano", "openai/gpt-5.4-nano"),
    "minimax-m2.5": generateAgent("minimax-m2.5", "minimax/minimax-m2.5"),
    "minimax-m2.5-free": generateAgent(
      "minimax-m2.5-free",
      "minimax/minimax-m2.5:free",
    ),
    "kimi-k2.6": generateAgent("kimi-k2.6", "moonshotai/kimi-k2.6"),
  },
});
