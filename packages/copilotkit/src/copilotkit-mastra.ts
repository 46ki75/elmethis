import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import dotenv from "dotenv";
import {
  CopilotRuntime,
  InMemoryAgentRunner,
  createCopilotHonoHandler,
} from "@copilotkit/runtime/v2";
import { MastraAgent } from "@ag-ui/mastra";
import { Agent } from "@mastra/core/agent";
import { Mastra } from "@mastra/core";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

dotenv.config();

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

const generateAgent = (id: string, name: string, modelId: string): Agent =>
  new Agent({
    id,
    name,
    instructions: "You are a helpful assistant!",
    model: openrouter(modelId),
  });

const mastra = new Mastra({
  agents: {
    "gpt-5.4-nano": generateAgent("gpt-5.4-nano", "GPT-5.4 Nano", "openai/gpt-5.4-nano"),
    "minimax-m2.5": generateAgent("minimax-m2.5", "MiniMax M2.5", "minimax/minimax-m2.5"),
    "minimax-m2.5-free": generateAgent(
      "minimax-m2.5-free",
      "MiniMax M2.5 Free",
      "minimax/minimax-m2.5:free",
    ),
    "kimi-k2.6": generateAgent("kimi-k2.6", "Kimi K2.6", "moonshotai/kimi-k2.6"),
  },
});

const runtime = new CopilotRuntime({
  agents: MastraAgent.getLocalAgents({ mastra, resourceId: "default" }),
  runner: new InMemoryAgentRunner(),
  a2ui: {
    injectA2UITool: true,
  },
});

const app = new Hono();

app.use("*", cors());

// `/copilotkit/agent/default/run`
// `/copilotkit/agent/gpt-5.4-nano/run`
// `/copilotkit/agent/minimax-m2.5/run`
// `/copilotkit/agent/kimi-k2.6/run`
app.route(
  "/",
  createCopilotHonoHandler({
    runtime,
    basePath: "/copilotkit",
  }),
);

const port = parseInt(process.env.PORT || "8080", 10);
const hostname = process.env.ADDRESS || "0.0.0.0";

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(
    `CopilotKit (Mastra) backend running on http://${info.address}:${info.port}`,
  );
});
