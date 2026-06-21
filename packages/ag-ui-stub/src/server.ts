import { serve } from "@hono/node-server";
import type { RunAgentInput } from "@ag-ui/core";
import { createConsola, LogLevels } from "consola";
import { Hono } from "hono";
import { cors } from "hono/cors";

import { agUiResponse } from "./response";
import { scenarioNames, scenarios, type ScenarioName } from "./scenarios";

const envLevel = process.env.LOG_LEVEL as keyof typeof LogLevels | undefined;
const logger = createConsola({
  level:
    envLevel && envLevel in LogLevels ? LogLevels[envLevel] : LogLevels.info,
});

const app = new Hono();

app.use("*", cors());

app.get("/", (c) =>
  c.json({
    name: "@elmethis/ag-ui-stub",
    usage: "POST /stub/agent/:scenario/run  (optional ?delay=<ms>)",
    scenarios: scenarioNames,
  }),
);

// e.g. `POST http://localhost:19103/stub/agent/tool-call/run`
app.post("/stub/agent/:scenario/run", async (c) => {
  const name = c.req.param("scenario") as ScenarioName;
  const scenario = scenarios[name];

  if (scenario === undefined) {
    return c.json(
      { error: `Unknown scenario '${name}'`, scenarios: scenarioNames },
      404,
    );
  }

  const input = (await c.req.json()) as RunAgentInput;
  const delayParam = c.req.query("delay");
  const chunkDelayMs = delayParam ? Number.parseInt(delayParam, 10) : 0;

  return agUiResponse(scenario, input, { chunkDelayMs });
});

const port = Number.parseInt(process.env.PORT ?? "19103", 10);
const hostname = process.env.ADDRESS ?? "0.0.0.0";

serve({ fetch: app.fetch, port, hostname }, (info) => {
  // Show a clickable host: 0.0.0.0 / :: aren't dialable, localhost is.
  const host =
    info.address === "0.0.0.0" || info.address === "::"
      ? "localhost"
      : info.address;
  const base = `http://${host}:${info.port}`;

  logger.success("@elmethis/ag-ui-stub listening", { url: base });

  const hints = scenarioNames
    .map((name) => `POST ${base}/stub/agent/${name}/run`)
    .join("\n");
  logger.box(`Endpoints (append ?delay=<ms> to pace the stream):\n\n${hints}`);
});
