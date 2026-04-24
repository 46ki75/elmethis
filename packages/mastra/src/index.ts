import { Agent } from "@mastra/core/agent";
import { Mastra } from "@mastra/core";
import { MCPClient } from "@mastra/mcp";
import { registerApiRoute } from "@mastra/core/server";
import { createOpenAI } from "@ai-sdk/openai";
import { getLocalAgent } from "@ag-ui/mastra";
import { EventEncoder } from "@ag-ui/encoder";

import "dotenv/config";
import type { RunAgentInput } from "@ag-ui/core";
import { convertContextToSystemMessage } from "./utils";

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
  model: openrouter.chat("minimax/minimax-m2.5"),
  defaultOptions: {
    maxSteps: 10,
    modelSettings: {
      maxOutputTokens: 20000,
    },
    providerOptions: {
      openrouter: {
        reasoning: { effort: "medium" },
        sort: "throughput",
      },
    },
  },
  tools: await mcp.listTools().catch(() => ({})),
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
          const body = (await c.req.json()) as RunAgentInput;

          console.log(body);

          let messages = [...body.messages];

          if (body.context.length > 0) {
            const contextContent =
              "## Runtime context (ephemeral, current turn only)\n" +
              body.context
                .map((i) => `### ${i.description}\n${i.value}`)
                .join("\n\n");

            const contextMessageId = "ag-ui-context";

            const contextMessage = convertContextToSystemMessage(
              body.context,
              contextMessageId,
            );

            if (contextMessage) {
              messages = body.messages.filter(
                (msg) => msg.id !== contextMessageId,
              );
              messages.push(contextMessage);
            }
          }

          const patchedBody: RunAgentInput = {
            ...body,
            messages,
            context: [],
          };

          const agentWrapper = getLocalAgent({
            mastra: mastraInstance,
            agentId: "agent",
            resourceId: body.threadId ?? "default",
          });

          const encoder = new EventEncoder();
          const { readable, writable } = new TransformStream<Uint8Array>();
          const writer = writable.getWriter();
          const textEncoder = new TextEncoder();

          const subscription = agentWrapper.run(patchedBody).subscribe({
            next(event) {
              writer
                .write(textEncoder.encode(encoder.encodeSSE(event)))
                .catch(() => subscription.unsubscribe());
            },
            error() {
              subscription.unsubscribe();
              writer.close().catch(() => {});
            },
            complete() {
              subscription.unsubscribe();
              writer.close().catch(() => {});
            },
          });

          c.req.raw.signal.addEventListener("abort", () => {
            subscription.unsubscribe();
            writer.close().catch(() => {});
          });

          console.log(messages);

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
