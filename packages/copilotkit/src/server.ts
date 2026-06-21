import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createCopilotHonoHandler } from "@copilotkit/runtime/v2";

import {
  copilotkitClaudeRuntime,
  wordleRuntime,
} from "./copilotkit-claude.ts";

import "dotenv/config";

const app = new Hono();

app.use("*", cors());

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
