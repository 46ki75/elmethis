import { Agent } from "@mastra/core/agent";
import { Mastra } from "@mastra/core";
import { MCPClient } from "@mastra/mcp";
import { registerApiRoute } from "@mastra/core/server";
import { RequestContext } from "@mastra/core/request-context";
import type { AgentChunkType } from "@mastra/core/stream";
import { createOpenAI } from "@ai-sdk/openai";
import { EventEncoder } from "@ag-ui/encoder";
import { EventType } from "@ag-ui/core";

import "dotenv/config";

// ── AG-UI → Mastra integration (hand-rolled) ──────────────────────────────────
//
// We intentionally do NOT use @ag-ui/mastra because its internal message
// conversion function silently drops `role: "system"` messages — they are
// never forwarded to the Mastra agent (bug in @ag-ui/mastra@1.0.1).
//
// AG-UI wire format  →  Mastra stream  →  AG-UI SSE events
//
// Mastra stream event mapping (from agent.stream().fullStream):
//   text-delta   → TEXT_MESSAGE_START (on first delta) + TEXT_MESSAGE_CONTENT
//   tool-call    → TOOL_CALL_START + TOOL_CALL_ARGS + TOOL_CALL_END
//   tool-result  → TOOL_CALL_RESULT
//   step-finish  → TEXT_MESSAGE_END (if in text) + rotate messageId
//                  (multi-step agents emit one step-finish per LLM call)
//
// Payload field names (from @mastra/core dist/stream/types.d.ts):
//   text-delta:  chunk.payload.text
//   tool-call:   chunk.payload.toolCallId, .toolName, .args
//   tool-result: chunk.payload.toolCallId, .result

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

// Converts AG-UI messages to the format Mastra's agent.stream() expects.
// system  → passed through as-is (fixes the @ag-ui/mastra bug)
// user    → { role, content: string }
// assistant → { role, content: (text | tool-call)[] }
// tool    → { role, content: [tool-result] }  (toolName resolved from history)
function convertMessages(messages: AgUiMessage[]) {
  const out: unknown[] = [];
  for (const msg of messages) {
    if (msg.role === "system") {
      // @ag-ui/mastra drops these; we pass them directly so the model sees them.
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
      // Mastra requires toolName on tool-result; look it up from assistant history.
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

// name: "openrouter" sets the provider ID so providerOptions.openrouter is matched correctly.
// Without it, createOpenAI defaults to "openai" and providerOptions.openrouter is silently ignored.
const openrouter = createOpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
  name: "openrouter",
});

// ── Agent ─────────────────────────────────────────────────────────────────────

const agent = new Agent({
  id: "my-assistant",
  name: "Assistant",
  // Keep instructions as a static string (not a function) so the prompt cache
  // hit rate stays high. Dynamic context from AG-UI is handled two ways:
  //   • system messages → passed as role:"system" entries in the messages array
  //   • context items   → not injected here (would break caching)
  instructions: "You are a helpful AI assistant.",
  model: openrouter.chat("moonshotai/kimi-k2.6"),
  defaultOptions: {
    maxSteps: 10,
    modelSettings: { maxOutputTokens: 20000 },
    providerOptions: {
      // reasoningEffort is the AI SDK field; maps to reasoning_effort in the request body.
      // sort: "throughput" asks OpenRouter to prefer the fastest available provider instance.
      openrouter: { reasoningEffort: "medium", sort: "throughput" },
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
          // Shape: { [name]: { id, description, inputSchema } }
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

          // Stream AG-UI SSE events back to the client via a TransformStream.
          // The async IIFE runs the Mastra stream in the background while the
          // Response starts streaming immediately.
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

              // agent.stream() returns MastraModelOutput; iterate .fullStream
              // for typed chunk events (see top-of-file comment for mapping).
              const output = await agentInstance.stream(
                mastraMessages as never,
                {
                  memory: { thread: threadId, resource: threadId },
                  runId,
                  clientTools,
                  requestContext,
                } as never,
              );

              // messageId groups all TEXT_MESSAGE_* events for one LLM response.
              // It resets on step-finish because multi-step runs produce a new
              // assistant message per step.
              let messageId = crypto.randomUUID();
              let inText = false;
              // reasoningMessageId is independent of messageId — reasoning and
              // text can interleave within a single step.
              let reasoningMessageId: string = crypto.randomUUID();

              for await (const chunk of (
                output as { fullStream: AsyncIterable<AgentChunkType> }
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
                    // AG-UI represents a tool call as three consecutive events.
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
                    messageId = crypto.randomUUID();
                    reasoningMessageId = crypto.randomUUID();
                    break;
                  // Mastra reasoning triple: reasoning-start → reasoning-delta → reasoning-end
                  // reasoning-signature carries the encrypted signature (e.g. Claude extended thinking)
                  // Payload fields: reasoning-start/end { id }, reasoning-delta { id, text },
                  //                 reasoning-signature { id, signature }
                  case "reasoning-start":
                    reasoningMessageId = chunk.payload["id"] as string;
                    emit({
                      type: EventType.REASONING_START,
                      messageId: reasoningMessageId,
                    });
                    emit({
                      type: EventType.REASONING_MESSAGE_START,
                      messageId: reasoningMessageId,
                      role: "reasoning",
                    });
                    break;
                  case "reasoning-delta":
                    emit({
                      type: EventType.REASONING_MESSAGE_CONTENT,
                      messageId: reasoningMessageId,
                      delta: chunk.payload["text"],
                    });
                    break;
                  case "reasoning-end":
                    emit({
                      type: EventType.REASONING_MESSAGE_END,
                      messageId: reasoningMessageId,
                    });
                    emit({
                      type: EventType.REASONING_END,
                      messageId: reasoningMessageId,
                    });
                    break;
                  case "reasoning-signature":
                    // Encrypted reasoning value (e.g. Claude's thinking signature)
                    emit({
                      type: EventType.REASONING_ENCRYPTED_VALUE,
                      subtype: "message",
                      entityId: chunk.payload["id"],
                      encryptedValue: chunk.payload["signature"],
                    });
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
