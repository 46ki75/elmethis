import { Agent } from "@mastra/core/agent";
import { Mastra } from "@mastra/core";
import { MCPClient } from "@mastra/mcp";
import { registerApiRoute } from "@mastra/core/server";
import { RequestContext } from "@mastra/core/request-context";
import { createOpenAI } from "@ai-sdk/openai";
import { EventEncoder } from "@ag-ui/encoder";
import { EventType } from "@ag-ui/core";

import "dotenv/config";

// ── AG-UI types (subset) ──────────────────────────────────────────────────────

type AgUiContentPart = { type: "text"; text: string } | { type: string };

type AgUiMessage =
  | { role: "system"; content: string | AgUiContentPart[] }
  | { role: "user"; content: string | AgUiContentPart[] }
  | {
      role: "assistant";
      content: string | AgUiContentPart[];
      toolCalls?: Array<{
        id: string;
        function: { name: string; arguments: string };
      }>;
    }
  | { role: "tool"; toolCallId: string; content: string };

type AgUiTool = { name: string; description: string; parameters: unknown };

type AgUiContextItem = { description: string; value: string };

type RunInput = {
  threadId: string;
  runId: string;
  messages: AgUiMessage[];
  tools: AgUiTool[];
  context: AgUiContextItem[];
  state?: unknown;
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function textContent(content: string | AgUiContentPart[]): string {
  if (typeof content === "string") return content;
  return content
    .filter((p): p is { type: "text"; text: string } => p.type === "text")
    .map((p) => p.text)
    .join("");
}

function convertMessages(messages: AgUiMessage[]) {
  const out: unknown[] = [];
  for (const msg of messages) {
    if (msg.role === "system") {
      out.push({ role: "system", content: textContent(msg.content) });
      continue;
    }
    if (msg.role === "user") {
      out.push({ role: "user", content: textContent(msg.content) });
    } else if (msg.role === "assistant") {
      const parts: unknown[] = [];
      const text = textContent(msg.content);
      if (text) parts.push({ type: "text", text });
      for (const tc of msg.toolCalls ?? []) {
        parts.push({
          type: "tool-call",
          toolCallId: tc.id,
          toolName: tc.function.name,
          args: JSON.parse(tc.function.arguments),
        });
      }
      out.push({ role: "assistant", content: parts });
    } else if (msg.role === "tool") {
      const toolName =
        messages
          .flatMap((m) => (m.role === "assistant" ? (m.toolCalls ?? []) : []))
          .find((tc) => tc.id === msg.toolCallId)?.function.name ?? "unknown";
      out.push({
        role: "tool",
        content: [
          {
            type: "tool-result",
            toolCallId: msg.toolCallId,
            toolName,
            result: msg.content,
          },
        ],
      });
    }
  }
  return out;
}

// ── MCP / Model ───────────────────────────────────────────────────────────────

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

// ── Agent ─────────────────────────────────────────────────────────────────────

const agent = new Agent({
  id: "my-assistant",
  name: "Assistant",
  instructions: "You are a helpful AI assistant.",
  model: openrouter.chat("minimax/minimax-m2.5"),
  defaultOptions: {
    maxSteps: 10,
    modelSettings: { maxOutputTokens: 20000 },
    providerOptions: {
      openrouter: { reasoning: { effort: "medium" }, sort: "throughput" },
    },
  },
  tools: await mcp.listTools().catch(() => ({})),
});

// ── Mastra ────────────────────────────────────────────────────────────────────

export const mastra = new Mastra({
  agents: { agent },
  server: {
    apiRoutes: [
      registerApiRoute("/ag-ui", {
        method: "POST",
        requiresAuth: false,
        handler: async (c) => {
          const mastraInstance = c.get("mastra");
          const body: RunInput = await c.req.json();
          const { threadId, runId, messages, tools } = body;

          const requestContext = new RequestContext();

          // AG-UI tools → Mastra clientTools
          const clientTools = (tools ?? []).reduce<Record<string, unknown>>(
            (acc, t) => {
              acc[t.name] = {
                id: t.name,
                description: t.description,
                inputSchema: t.parameters,
              };
              return acc;
            },
            {},
          );

          const mastraMessages = convertMessages(messages);
          const agentInstance = mastraInstance.getAgent("agent");

          const encoder = new EventEncoder();
          const { readable, writable } = new TransformStream<Uint8Array>();
          const writer = writable.getWriter();
          const enc = new TextEncoder();
          const emit = (event: object) =>
            writer
              .write(enc.encode(encoder.encodeSSE(event as never)))
              .catch(() => {});

          (async () => {
            try {
              emit({ type: EventType.RUN_STARTED, threadId, runId });

              const output = await agentInstance.stream(
                mastraMessages as never,
                {
                  memory: { thread: threadId, resource: threadId },
                  runId,
                  clientTools,
                  requestContext,
                } as never,
              );

              let messageId = crypto.randomUUID();
              let inText = false;

              type Chunk = {
                type: string;
                payload: Record<string, unknown>;
              };

              for await (const chunk of (
                output as { fullStream: AsyncIterable<Chunk> }
              ).fullStream) {
                switch (chunk.type) {
                  case "text-delta":
                    if (!inText) {
                      emit({
                        type: EventType.TEXT_MESSAGE_START,
                        messageId,
                        role: "assistant",
                      });
                      inText = true;
                    }
                    emit({
                      type: EventType.TEXT_MESSAGE_CONTENT,
                      messageId,
                      delta: chunk.payload["text"],
                    });
                    break;
                  case "tool-call":
                    if (inText) {
                      emit({ type: EventType.TEXT_MESSAGE_END, messageId });
                      inText = false;
                    }
                    emit({
                      type: EventType.TOOL_CALL_START,
                      toolCallId: chunk.payload["toolCallId"],
                      toolCallName: chunk.payload["toolName"],
                      parentMessageId: messageId,
                    });
                    emit({
                      type: EventType.TOOL_CALL_ARGS,
                      toolCallId: chunk.payload["toolCallId"],
                      delta: JSON.stringify(chunk.payload["args"]),
                    });
                    emit({
                      type: EventType.TOOL_CALL_END,
                      toolCallId: chunk.payload["toolCallId"],
                    });
                    break;
                  case "tool-result":
                    emit({
                      type: EventType.TOOL_CALL_RESULT,
                      messageId: crypto.randomUUID(),
                      role: "tool",
                      toolCallId: chunk.payload["toolCallId"],
                      content: JSON.stringify(chunk.payload["result"]),
                    });
                    break;
                  case "step-finish":
                    if (inText) {
                      emit({ type: EventType.TEXT_MESSAGE_END, messageId });
                      inText = false;
                    }
                    // New message ID for the next LLM step
                    messageId = crypto.randomUUID();
                    break;
                }
              }

              emit({ type: EventType.RUN_FINISHED, threadId, runId });
            } catch (err) {
              emit({
                type: EventType.RUN_ERROR,
                message: err instanceof Error ? err.message : String(err),
              });
            } finally {
              writer.close().catch(() => {});
            }
          })();

          c.req.raw.signal.addEventListener("abort", () => {
            writer.close().catch(() => {});
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
