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
// This development backend spends the locally signed-in subscription.
const hostname = process.env.ADDRESS || "127.0.0.1";

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(
    `CopilotKit (Codex subscription) backend running on http://${info.address}:${info.port}`,
  );
});
