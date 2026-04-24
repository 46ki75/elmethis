import {
  $,
  component$,
  NoSerialize,
  noSerialize,
  useSignal,
  useStore,
  useVisibleTask$,
  type CSSProperties,
} from "@builder.io/qwik";

import {
  BaseEvent,
  compactEvents,
  EventType,
  HttpAgent,
  Message,
  MessagesSnapshotEvent,
  randomUUID,
} from "@ag-ui/client";

import { z } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import { ElmAgUiMessageRenderer } from "./elm-ag-ui-message-renderer";
import { ElmAgUiInput } from "./elm-ag-ui-input";

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------

export interface ToolDef<T extends z.ZodObject<z.ZodRawShape>> {
  description: string;
  schema: T;
  execute: (args: z.infer<T>) => unknown;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type AnyToolDef = ToolDef<any>;
export type ToolRegistry = Record<string, AnyToolDef>;

export function defineTool<T extends z.ZodObject<z.ZodRawShape>>(
  tool: ToolDef<T>,
): ToolDef<T> {
  return tool;
}

export function getToolDefinitions(registry: ToolRegistry) {
  return Object.entries(registry).map(([name, { description, schema }]) => ({
    name,
    description,
    parameters: zodToJsonSchema(schema) as {
      type: "object";
      properties: Record<string, unknown>;
      required: string[];
    },
  }));
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export interface UseAgentOptions {
  url: string;
  tools?: ToolRegistry;
}

export function useAgent({ url, tools }: UseAgentOptions) {
  const httpAgent = useSignal<NoSerialize<HttpAgent> | null>(null);
  const toolsRef = useSignal<NoSerialize<ToolRegistry>>(noSerialize(tools));

  const agent = useStore<{ messages: Message[]; events: BaseEvent[] }>({
    messages: [],
    events: [],
  });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    if (!httpAgent.value) {
      httpAgent.value = noSerialize(new HttpAgent({ url }));

      cleanup(() => {
        httpAgent.value = null;
      });
    }

    if (httpAgent.value) {
      let pendingToolMessages: Message[] = [];

      const subscription = httpAgent.value?.subscribe({
        onEvent({ messages: newMessages, event }) {
          if (agent.messages.length < newMessages.length) {
            agent.messages.push(...newMessages.slice(agent.messages.length));
          }
          const events = [...agent.events, event];
          agent.events = compactEvents(events);
        },
        onTextMessageContentEvent({ event }) {
          const lastAssistantMessageRef = agent.messages.findLast(
            (msg) => msg.role === "assistant",
          );
          if (lastAssistantMessageRef) {
            lastAssistantMessageRef.content =
              (lastAssistantMessageRef.content ?? "") + event.delta;
          }
        },
        onToolCallArgsEvent({ event }) {
          const lastAssistantMessageRef = agent.messages.findLast(
            (msg) => msg.role === "assistant",
          );
          if (lastAssistantMessageRef) {
            const toolCallRef = lastAssistantMessageRef.toolCalls?.find(
              (toolCall) => toolCall.id === event.toolCallId,
            );
            if (toolCallRef) {
              toolCallRef.function.arguments =
                toolCallRef.function.arguments + event.delta;
            }
          }
        },
        onToolCallEndEvent({ event, toolCallName }) {
          const registry: ToolRegistry = toolsRef.value ?? {};
          const tool = registry[toolCallName];
          if (tool) {
            const lastAssistantMsg = agent.messages.findLast(
              (msg) => msg.role === "assistant",
            );
            const toolCall = lastAssistantMsg?.toolCalls?.find(
              (tc) => tc.id === event.toolCallId,
            );
            const args = toolCall?.function.arguments
              ? JSON.parse(toolCall.function.arguments)
              : {};
            const result = JSON.stringify(tool.execute(args));
            pendingToolMessages.push({
              id: randomUUID(),
              role: "tool",
              content: result,
              toolCallId: event.toolCallId,
            } as Message);
          }
        },
        async onRunFinalized({ messages }) {
          const messagesSnapshotEvent: MessagesSnapshotEvent = {
            type: EventType.MESSAGES_SNAPSHOT,
            messages: messages as Message[],
          };
          agent.events.push(messagesSnapshotEvent);

          if (pendingToolMessages.length > 0 && httpAgent.value) {
            httpAgent.value.messages.push(...pendingToolMessages);
            pendingToolMessages = [];
            await httpAgent.value.runAgent({
              tools: getToolDefinitions(toolsRef.value ?? {}),
            });
          }
        },
      });

      cleanup(() => {
        subscription.unsubscribe();
      });
    }
  });

  const send = $(async (content: string) => {
    if (httpAgent.value) {
      httpAgent.value.messages.push({
        id: randomUUID(),
        role: "user",
        content: content,
      });

      await httpAgent.value.runAgent({
        tools: getToolDefinitions(toolsRef.value ?? {}),
        context: [
          {
            description: "Current date and time",
            value: new Date().toString(),
          },
        ],
      });
    }
  });

  const input = useSignal("");

  const onInput$ = $((_event: InputEvent, element: HTMLTextAreaElement) => {
    input.value = element.value;
  });

  const onSubmit$ = $((_event: Event, element: Element) => {
    if (input.value.trim() !== "") {
      send(input.value);
      input.value = "";
      const textarea = element.querySelector("textarea");
      if (textarea) {
        textarea.value = "";
      }
    }
  });

  const AgentUI = component$<{ class?: string; style?: CSSProperties }>(
    ({ class: className, style }) => (
      <div class={className} style={style}>
        <div>
          <ElmAgUiMessageRenderer messages={agent.messages} />
        </div>
        <ElmAgUiInput
          style={{ position: "fixed", bottom: 16, width: "calc(100% - 32px)" }}
          onInput$={onInput$}
          onSubmit$={onSubmit$}
        />
      </div>
    ),
  );

  return { messages: agent.messages, events: agent.events, send, AgentUI };
}
