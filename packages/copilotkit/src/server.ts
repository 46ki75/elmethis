import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createCopilotHonoHandler } from "@copilotkit/runtime/v2";

import {
  copilotkitBuiltinRuntime,
  wordleRuntime,
} from "./copilotkit-builtin.ts";
import { copilotkitMastraRuntime } from "./copilotkit-mastra.ts";

import "dotenv/config";

const app = new Hono();

app.use("*", cors());

// `/copilotkit/builtin/agent/default/run`
// `/copilotkit/builtin/agent/gpt-5.4-nano/run`
// `/copilotkit/builtin/agent/minimax-m2.5/run`
// `/copilotkit/builtin/agent/kimi-k2.6/run`
app.route(
  "/",
  createCopilotHonoHandler({
    runtime: copilotkitBuiltinRuntime,
    basePath: "/copilotkit/builtin",
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

// `/copilotkit/mastra/agent/default/run`
// `/copilotkit/mastra/agent/gpt-5.4-nano/run`
// `/copilotkit/mastra/agent/minimax-m2.5/run`
// `/copilotkit/mastra/agent/kimi-k2.6/run`
app.route(
  "/",
  createCopilotHonoHandler({
    runtime: copilotkitMastraRuntime,
    basePath: "/copilotkit/mastra",
  }),
);

const port = parseInt(process.env.PORT || "8080", 10);
const hostname = process.env.ADDRESS || "0.0.0.0";

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(
    `CopilotKit (Mastra) backend running on http://${info.address}:${info.port}`,
  );
});
