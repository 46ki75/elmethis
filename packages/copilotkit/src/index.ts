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

const agent = new BuiltInAgent({
  model: openrouter(process.env.MODEL_ID || "openai/gpt-5.4-nano"),
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
      reasoning: { effort: "medium" },
    },
  },
  tools: [],
});

const runtime = new CopilotRuntime({
  agents: { default: agent },
  runner: new InMemoryAgentRunner(),
});

const app = new Hono();

app.use("*", cors());
app.route("/", createCopilotHonoHandler({ runtime, basePath: "/copilotkit" }));

const port = parseInt(process.env.PORT || "8080", 10);
const hostname = process.env.ADDRESS || "0.0.0.0";

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(
    `CopilotKit backend running on http://${info.address}:${info.port}`,
  );
});
