import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createCopilotHonoHandler } from "@copilotkit/runtime/v2";

import { copilotkitClaudeRuntime, wordleRuntime } from "./copilotkit-claude.ts";
import { weatherMcpApp } from "./mcp.ts";

import "dotenv/config";

const app = new Hono();

app.use("*", cors());

// `/mcp` — stub Weather MCP server (Streamable HTTP), merged in from the
// former `@elmethis/mcp-server` package so a single backend serves both the
// CopilotKit agents and the MCP endpoint the qwik hooks exercise.
app.route("/", weatherMcpApp);

// `/copilotkit/claude/agent/opus/run`
// `/copilotkit/claude/agent/sonnet/run`
// `/copilotkit/claude/agent/haiku/run`
app.route(
  "/",
  createCopilotHonoHandler({
    runtime: copilotkitClaudeRuntime,
    basePath: "/copilotkit/claude",
  }),
);

// `/copilotkit/wordle/agent/default/run`
app.route(
  "/",
  createCopilotHonoHandler({
    runtime: wordleRuntime,
    basePath: "/copilotkit/wordle",
  }),
);

const port = parseInt(process.env.PORT || "8080", 10);
const hostname = process.env.ADDRESS || "0.0.0.0";

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(
    `CopilotKit (Claude Agent SDK) backend running on http://${info.address}:${info.port}`,
  );
});
