import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { MastraServer } from "@mastra/hono";
import { MastraAgent } from "@ag-ui/mastra";
import { EventEncoder } from "@ag-ui/encoder";
import dotenv from "dotenv";
import { mastra } from "./mastra/index.ts";

dotenv.config();

const app = new Hono();
app.use("*", cors());

// AG-UI protocol handler: /copilotkit/agent/:agentId/run
app.post("/copilotkit/agent/:agentId/run", async (c) => {
  const agentId = c.req.param("agentId");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const input = (await c.req.json()) as any;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mastraAgent = mastra.getAgent(agentId as any);
  if (!mastraAgent) {
    return c.json(
      { error: "agent_not_found", message: `Agent '${agentId}' not found` },
      404,
    );
  }

  const accept = c.req.header("Accept") ?? "";
  const encoder = new EventEncoder({ accept });
  const agent = new MastraAgent({ agent: mastraAgent, resourceId: agentId });

  const stream = new ReadableStream({
    start(controller) {
      agent.run(input).subscribe({
        next(event) {
          controller.enqueue(
            new TextEncoder().encode(encoder.encodeSSE(event)),
          );
        },
        error() {
          controller.close();
        },
        complete() {
          controller.close();
        },
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": encoder.getContentType(),
      "Cache-Control": "no-cache",
      "Connection": "keep-alive",
    },
  });
});

const server = new MastraServer({ app, mastra });
await server.init();

const port = parseInt(process.env.PORT || "8080", 10);
const hostname = process.env.ADDRESS || "0.0.0.0";

serve({ fetch: app.fetch, port, hostname }, (info) => {
  console.log(`Mastra backend running on http://${info.address}:${info.port}`);
});
