import "dotenv/config";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createCancellableCopilotHonoHandler } from "./cancellable-handler.ts";

import { copilotkitCodexRuntime, wordleRuntime } from "./copilotkit-codex.ts";
import { weatherMcpApp } from "./mcp.ts";

const app = new Hono();

app.use("*", cors());

// `/mcp` — stub Weather MCP server (Streamable HTTP), merged in from the
// former `@elmethis/mcp-server` package so a single backend serves both the
// CopilotKit agents and the MCP endpoint used by frontend integrations.
app.route("/", weatherMcpApp);

// `/copilotkit/codex/agent/default/run`
app.route(
  "/",
  createCancellableCopilotHonoHandler({
    runtime: copilotkitCodexRuntime,
    basePath: "/copilotkit/codex",
  }),
);

// `/copilotkit/wordle/agent/default/run`
app.route(
  "/",
  createCancellableCopilotHonoHandler({
    runtime: wordleRuntime,
    basePath: "/copilotkit/wordle",
  }),
);

const port = parseInt(process.env.PORT || "8080", 10);
// SIWC requests must serve only the user who authorized this local runtime.
const hostname = process.env.ADDRESS || "127.0.0.1";

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(
    `CopilotKit (ChatGPT plan via SIWC) backend running on http://${info.address}:${info.port}`,
  );
  console.log(
    "ChatGPT plan usage is managed at https://chatgpt.com/settings/usage",
  );
});
