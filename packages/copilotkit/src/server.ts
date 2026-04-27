import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { createCopilotHonoHandler } from "@copilotkit/runtime/v2";
import { copilotkitBuiltinRuntime } from "./copilotkit-builtin.ts";

import "dotenv/config";

const app = new Hono();

app.use("*", cors());

// `/copilotkit/agent/default/run`
// `/copilotkit/agent/gpt-5.4-nano/run`
// `/copilotkit/agent/minimax-m2.5/run`
// `/copilotkit/agent/kimi-k2.6/run`
app.route(
  "/",
  createCopilotHonoHandler({
    runtime: copilotkitBuiltinRuntime,
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
