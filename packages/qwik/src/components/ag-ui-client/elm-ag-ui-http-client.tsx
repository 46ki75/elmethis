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

import styles from "./elm-ag-ui-http-client.module.css";

// AG-UI
import {
  BaseEvent,
  compactEvents,
  EventType,
  HttpAgent,
  Message,
  MessagesSnapshotEvent,
  randomUUID,
} from "@ag-ui/client";
import { ElmAgUiMessageRenderer } from "./elm-ag-ui-message-renderer";
import { ElmAgUiInput } from "./elm-ag-ui-input";

import { v4, v7 } from "uuid";

// ---------------------------------------------------------------------------
// Tool registry
// ---------------------------------------------------------------------------

interface ToolEntry {
  description: string;
  parameters: {
    type: "object";
    properties: Record<string, unknown>;
    required: string[];
  };
  execute: (args?: Record<string, unknown>) => unknown;
}

type ToolRegistry = Record<string, ToolEntry>;

function getToolDefinitions(registry: ToolRegistry) {
  return Object.entries(registry).map(
    ([name, { description, parameters }]) => ({
      name,
      description,
      parameters,
    }),
  );
}

const toolRegistry: ToolRegistry = {
  generateUuid: {
    description: "Generate a random UUID v4 string",
    parameters: {
      type: "object",
      properties: {
        version: {
          type: "string",
          description:
            "The version of UUID to generate. Supported values are 'v4' and 'v7'.",
        },
      },
      required: ["version"],
    },
    execute: ({ version }) => {
      if (version === "v4") {
        return { uuid: v4() };
      } else if (version === "v7") {
        return { uuid: v7() };
      } else {
        throw new Error("Unsupported UUID version");
      }
    },
  },
};

export interface ElmAgUiHttpClientProps {
  class?: string;

  style?: CSSProperties;

  url: string;
}

export const ElmAgUiHttpClient = component$<ElmAgUiHttpClientProps>(
  ({ class: className, style, url }) => {
    const httpAgent = useSignal<NoSerialize<HttpAgent> | null>(null);

    const agent = useStore<{ messages: Message[]; events: BaseEvent[] }>({
      messages: [],
      events: [],
    });

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ cleanup }) => {
      if (!httpAgent.value) {
        httpAgent.value = noSerialize(
          new HttpAgent({
            url,
            // headers: {
            //   Authorization: "Bearer your-api-key",
            // },
          }),
        );

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
            const tool = toolRegistry[toolCallName];
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
                tools: getToolDefinitions(toolRegistry),
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
          tools: getToolDefinitions(toolRegistry),
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

    const onInput$ = $((event: InputEvent, element: HTMLTextAreaElement) => {
      input.value = element.value;
    });

    const onSubmit$ = $((event: Event, element: Element) => {
      if (input.value.trim() !== "") {
        send(input.value);
        input.value = "";
        const textarea = element.querySelector("textarea");
        if (textarea) {
          textarea.value = "";
        }
      }
    });

    return (
      <div class={[styles["elm-my-something"], className]} style={style}>
        <button onClick$={() => send("Generate a random UUID v4 string")}>
          Generate UUID v4
        </button>

        <button
          onClick$={() =>
            send("What is the new feature called Amazon S3 Files?")
          }
        >
          What is Amazon S3 Files?
        </button>

        <button onClick$={() => send("What date is it today?")}>
          What date is it today?
        </button>

        <div>
          <ElmAgUiMessageRenderer messages={agent.messages} />
        </div>

        <ElmAgUiInput
          style={{ position: "fixed", bottom: 16, width: "calc(100% - 32px)" }}
          onInput$={onInput$}
          onSubmit$={onSubmit$}
        />
      </div>
    );
  },
);
