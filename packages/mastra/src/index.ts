import { Agent } from "@mastra/core/agent";
import { Mastra } from "@mastra/core";
import { MCPClient } from "@mastra/mcp";
import { registerApiRoute } from "@mastra/core/server";
import { createOpenAI } from "@ai-sdk/openai";
import { getLocalAgent } from "@ag-ui/mastra";
import { EventEncoder } from "@ag-ui/encoder";

import "dotenv/config";

const mcp = new MCPClient({
  servers: {
    aws_knowledge: {
      url: new URL("https://knowledge-mcp.global.api.aws"),
    },
  },
});

const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

const agent = new Agent({
  id: "my-assistant",
  name: "Assistant",
  instructions: "You are a helpful AI assistant.",
  model: openrouter.chat("openai/gpt-5.4-nano"),
  defaultOptions: {
    maxSteps: 10,
    modelSettings: {
      maxOutputTokens: 20000,
    },
    providerOptions: {
      openrouter: {
        reasoning: { effort: "medium" },
      },
    },
  },
  tools: await mcp.listTools(),
});

export const mastra = new Mastra({
  agents: { agent },
  server: {
    apiRoutes: [
      registerApiRoute("/ag-ui", {
        method: "POST",
        requiresAuth: false,
        handler: async (c) => {
          const mastraInstance = c.get("mastra");
          const body = await c.req.json();

          const agentWrapper = getLocalAgent({
            mastra: mastraInstance,
            agentId: "agent",
            resourceId: body.threadId ?? "default",
          });

          const encoder = new EventEncoder();
          const { readable, writable } = new TransformStream<Uint8Array>();
          const writer = writable.getWriter();
          const textEncoder = new TextEncoder();

          agentWrapper.run(body).subscribe({
            next(event) {
              writer.write(textEncoder.encode(encoder.encodeSSE(event)));
            },
            error() {
              writer.close();
            },
            complete() {
              writer.close();
            },
          });

          return new Response(readable, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache",
              Connection: "keep-alive",
            },
          });
        },
      }),
    ],
  },
});
