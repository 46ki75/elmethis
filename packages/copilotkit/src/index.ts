import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import dotenv from "dotenv";
import {
  CopilotRuntime,
  InMemoryAgentRunner,
  createCopilotHonoHandler,
} from "@copilotkit/runtime/v2";
import { BuiltInAgent } from "@copilotkit/runtime/v2";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

dotenv.config();

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

const runtime = new CopilotRuntime({
  agents: {
    "gpt-5.4-nano": generateAgent("openai/gpt-5.4-nano"),
    "minimax-m2.5": generateAgent("minimax/minimax-m2.5"),
    "kimi-k2.6": generateAgent("moonshotai/kimi-k2.6"),
  },
  runner: new InMemoryAgentRunner(),
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
    hooks: {
      onRequest: (ctx) => {
        console.log(ctx);
      },
    },
  }),
);

const port = parseInt(process.env.PORT || "8080", 10);
const hostname = process.env.ADDRESS || "0.0.0.0";

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(
    `CopilotKit backend running on http://${info.address}:${info.port}`,
  );
});
