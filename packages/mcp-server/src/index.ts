import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import {
  createConsola,
  LogLevels,
  type ConsolaInstance,
} from "consola";
import { z } from "zod";
import { randomUUID } from "node:crypto";

const envLevel = process.env.LOG_LEVEL as
  | keyof typeof LogLevels
  | undefined;
const rootLogger = createConsola({
  level:
    envLevel && envLevel in LogLevels
      ? LogLevels[envLevel]
      : LogLevels.debug,
});

const CONDITIONS = [
  "Sunny",
  "Partly cloudy",
  "Cloudy",
  "Light rain",
  "Thunderstorm",
  "Snow",
];

// Stable hash so the same city echoes the same weather across calls
// for the lifetime of the process — handy for spotting agent caching
// vs re-fetch behavior without wiring up a real weather API.
function hashCity(city: string): number {
  let h = 0;
  for (let i = 0; i < city.length; i++) {
    h = (h * 31 + city.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

function buildServer(log: ConsolaInstance): McpServer {
  const server = new McpServer(
    { name: "elmethis-weather-mcp", version: "0.0.1" },
    { capabilities: {} },
  );

  server.registerPrompt(
    "daily_briefing",
    {
      description:
        "Ask the agent for a quick personal briefing: weather, calendar " +
        "vibes, and one fun fact. Takes no arguments.",
      argsSchema: {},
    },
    async () => {
      log.info("prompt requested", { prompt: "daily_briefing" });
      return {
        description: "Generic morning briefing prompt",
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                "Good morning! Give me a short daily briefing: a one-line " +
                "weather summary for my city using the weather tool, my " +
                "mood for the day, and one fun fact. Keep it under 80 words.",
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "weather_report",
    {
      description:
        "Generate a polished weather report for one or more cities " +
        "using the weather tool.",
      argsSchema: {
        cities: z
          .string()
          .min(1)
          .describe(
            "Comma-separated list of cities, e.g. 'Tokyo, Paris, " +
              "San Francisco'. Each will be looked up via the weather tool.",
          ),
        tone: z
          .enum(["formal", "casual", "poetic"])
          .optional()
          .describe(
            "Stylistic tone for the report. Defaults to 'casual' when omitted.",
          ),
      },
    },
    async ({ cities, tone }) => {
      log.info("prompt requested", {
        prompt: "weather_report",
        cities,
        tone,
      });
      const effectiveTone = tone ?? "casual";
      return {
        description: `Weather report for: ${cities}`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `Write a ${effectiveTone} weather report for these cities: ${cities}.\n` +
                "For each city, call the weather tool first, then summarize " +
                "the result in one sentence. End with a single overall " +
                "recommendation (e.g., which city has the nicest weather " +
                "right now).",
            },
          },
        ],
      };
    },
  );

  server.registerPrompt(
    "trip_planner",
    {
      description:
        "Plan a short trip given a destination and number of days. " +
        "Uses the weather tool to consider current conditions.",
      argsSchema: {
        destination: z
          .string()
          .min(1)
          .describe("Destination city or region for the trip."),
        days: z
          .string()
          .regex(/^\d+$/)
          .describe(
            "Number of days for the trip, as a decimal integer string " +
              "(MCP prompt args are always strings).",
          ),
        interests: z
          .string()
          .optional()
          .describe(
            "Optional comma-separated interests, e.g. 'food, history, hiking'. " +
              "Used to tailor the itinerary.",
          ),
      },
    },
    async ({ destination, days, interests }) => {
      log.info("prompt requested", {
        prompt: "trip_planner",
        destination,
        days,
        interests,
      });
      const interestsLine = interests
        ? `\nInterests: ${interests}.`
        : "";
      return {
        description: `Trip plan: ${destination} (${days} days)`,
        messages: [
          {
            role: "user",
            content: {
              type: "text",
              text:
                `Plan a ${days}-day trip to ${destination}.${interestsLine}\n` +
                "Start by calling the weather tool for the destination, " +
                "then suggest a day-by-day itinerary that takes the " +
                "current conditions into account. Be concrete: name " +
                "specific neighborhoods, food, or activities.",
            },
          },
        ],
      };
    },
  );

  server.registerTool(
    "get_weather",
    {
      description:
        "Get the current weather for a city. Returns a stub response — " +
        "not real meteorological data.",
      inputSchema: {
        city: z
          .string()
          .min(1)
          .describe(
            "City name. Natural language is fine — e.g. 'Tokyo', " +
              "'the city of Paris', 'San Francisco, California'. The " +
              "value is used verbatim as the lookup key.",
          ),
      },
    },
    async ({ city }) => {
      const h = hashCity(city);
      const result = {
        city,
        condition: CONDITIONS[h % CONDITIONS.length],
        temperature_c: 10 + (h % 25),
        humidity_percent: 40 + ((h >> 3) % 50),
        wind_kph: (h >> 5) % 30,
        observed_at: new Date().toISOString(),
        note: "Stub data — this server does not call a real weather API.",
      };
      log.info("weather queried", {
        tool: "get_weather",
        city,
        condition: result.condition,
        temperature_c: result.temperature_c,
      });
      return {
        content: [{ type: "text", text: JSON.stringify(result) }],
      };
    },
  );

  return server;
}

const app = new Hono<{ Variables: { log: ConsolaInstance } }>();

app.use("*", async (c, next) => {
  const reqId = randomUUID().slice(0, 8);
  // withTag prepends `[<reqId>]` to every line, threading the request
  // identity through tool-call logs without re-binding fields.
  const reqLog = rootLogger.withTag(reqId);
  c.set("log", reqLog);
  const start = Date.now();
  await next();
  reqLog.info("request", {
    method: c.req.method,
    path: new URL(c.req.url).pathname,
    status: c.res.status,
    ms: Date.now() - start,
  });
});

// Browsers connecting from Storybook (different port) need CORS. The MCP
// transport sets `Mcp-Session-Id` on stateful sessions, so expose it.
app.use(
  "*",
  cors({
    origin: (origin) => origin ?? "*",
    allowMethods: ["GET", "POST", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Mcp-Session-Id", "Mcp-Protocol-Version"],
    exposeHeaders: ["Mcp-Session-Id"],
  }),
);

app.all("/mcp", async (c) => {
  // Stateless mode: each request gets a fresh server + transport pair
  // bound to the request's tagged logger so tool logs carry the reqId.
  const server = buildServer(c.get("log"));
  const transport = new WebStandardStreamableHTTPServerTransport({
    sessionIdGenerator: undefined,
  });
  await server.connect(transport);
  return await transport.handleRequest(c.req.raw);
});

app.get("/", (c) =>
  c.json({
    name: "elmethis-weather-mcp",
    endpoints: { mcp: "/mcp" },
  }),
);

const port = Number(process.env.PORT ?? 19102);
serve({ fetch: app.fetch, port }, ({ port }) => {
  rootLogger.success("Weather MCP listening", {
    port,
    url: `http://localhost:${port}/mcp`,
  });
});
