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

interface Todo {
  id: string;
  title: string;
  done: boolean;
  createdAt: string;
}

const store = new Map<string, Todo>();

const envLevel = process.env.LOG_LEVEL as
  | keyof typeof LogLevels
  | undefined;
const rootLogger = createConsola({
  level:
    envLevel && envLevel in LogLevels
      ? LogLevels[envLevel]
      : LogLevels.debug,
});

function storeSummary() {
  const total = store.size;
  const pending = Array.from(store.values()).filter((t) => !t.done).length;
  return { total, pending };
}

function buildServer(log: ConsolaInstance): McpServer {
  const server = new McpServer(
    { name: "elmethis-todo-mcp", version: "0.0.1" },
    { capabilities: {} },
  );

  server.registerTool(
    "add_todo",
    {
      description: "Create a new todo item. Returns the created item.",
      inputSchema: {
        title: z.string().min(1).describe("Short description of the task"),
      },
    },
    async ({ title }) => {
      const todo: Todo = {
        id: randomUUID(),
        title,
        done: false,
        createdAt: new Date().toISOString(),
      };
      store.set(todo.id, todo);
      log.info("todo added", {
        tool: "add_todo",
        id: todo.id,
        title,
        store: storeSummary(),
      });
      return {
        content: [{ type: "text", text: JSON.stringify(todo) }],
      };
    },
  );

  server.registerTool(
    "list_todos",
    {
      description: "List all todos. Optionally filter by completion status.",
      inputSchema: {
        done: z
          .boolean()
          .optional()
          .describe(
            "If true, return only completed todos; if false, return only " +
              "pending ones. Omit to return all.",
          ),
      },
    },
    async ({ done }) => {
      const all = Array.from(store.values());
      const filtered =
        done === undefined ? all : all.filter((t) => t.done === done);
      log.info("todos listed", {
        tool: "list_todos",
        filter: done === undefined ? "all" : done ? "done" : "pending",
        count: filtered.length,
        store: storeSummary(),
      });
      return {
        content: [{ type: "text", text: JSON.stringify(filtered) }],
      };
    },
  );

  server.registerTool(
    "complete_todo",
    {
      description: "Mark a todo as done by id.",
      inputSchema: {
        id: z.string().describe("Id of the todo to complete"),
      },
    },
    async ({ id }) => {
      const todo = store.get(id);
      if (!todo) {
        log.warn("todo not found", { tool: "complete_todo", id });
        return {
          isError: true,
          content: [{ type: "text", text: `No todo with id "${id}"` }],
        };
      }
      todo.done = true;
      log.info("todo completed", {
        tool: "complete_todo",
        id,
        title: todo.title,
        store: storeSummary(),
      });
      return {
        content: [{ type: "text", text: JSON.stringify(todo) }],
      };
    },
  );

  server.registerTool(
    "delete_todo",
    {
      description: "Delete a todo by id.",
      inputSchema: {
        id: z.string().describe("Id of the todo to delete"),
      },
    },
    async ({ id }) => {
      const existed = store.delete(id);
      if (existed) {
        log.info("todo deleted", {
          tool: "delete_todo",
          id,
          store: storeSummary(),
        });
      } else {
        log.warn("todo not found", { tool: "delete_todo", id });
      }
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ id, deleted: existed }),
          },
        ],
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
    name: "elmethis-todo-mcp",
    endpoints: { mcp: "/mcp" },
    todos: store.size,
  }),
);

const port = Number(process.env.PORT ?? 19102);
serve({ fetch: app.fetch, port }, ({ port }) => {
  rootLogger.success("ToDo MCP listening", {
    port,
    url: `http://localhost:${port}/mcp`,
  });
});
