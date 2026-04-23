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

            if (event.type === EventType.TEXT_MESSAGE_CONTENT) {
              const incomingContent = event.delta;

              const lastAssistantMessageRef = agent.messages.findLast(
                (msg) => msg.role === "assistant",
              );

              if (lastAssistantMessageRef?.content && incomingContent) {
                lastAssistantMessageRef.content =
                  lastAssistantMessageRef?.content + incomingContent;
              } else if (lastAssistantMessageRef && incomingContent) {
                lastAssistantMessageRef.content = String(incomingContent);
              }
            }

            const events = [...agent.events, event];
            agent.events = compactEvents(events);
          },
          onToolCallEndEvent({ event, toolCallName }) {
            if (toolCallName === "generateUuidV4") {
              pendingToolMessages.push({
                id: randomUUID(),
                role: "tool",
                content: randomUUID(),
                toolCallId: event.toolCallId,
              } as Message);
            }
          },
          async onRunFinalized({ messages }) {
            console.info(messages);
            const messagesSnapshotEvent: MessagesSnapshotEvent = {
              type: EventType.MESSAGES_SNAPSHOT,
              messages: messages as Message[],
            };
            agent.events.push(messagesSnapshotEvent);
            console.info(agent.events);

            if (pendingToolMessages.length > 0 && httpAgent.value) {
              httpAgent.value.messages.push(...pendingToolMessages);
              pendingToolMessages = [];
              await httpAgent.value.runAgent({
                tools: [
                  {
                    name: "generateUuidV4",
                    description: "Generate a random UUID v4 string",
                    parameters: {
                      type: "object",
                      properties: {},
                      required: [],
                    },
                  },
                ],
              });
            }
          },
        });

        cleanup(() => {
          subscription.unsubscribe();
        });
      }
    });

    const send = $(async () => {
      if (httpAgent.value) {
        httpAgent.value.messages.push({
          id: randomUUID(),
          role: "user",
          content: "Generate a random UUID v4 string",
        });

        await httpAgent.value.runAgent({
          tools: [
            {
              name: "generateUuidV4",
              description: "Generate a random UUID v4 string",
              parameters: {
                type: "object",
                properties: {},
                required: [],
              },
            },
          ],
        });
      }
    });

    return (
      <div class={[styles["elm-my-something"], className]} style={style}>
        <button onClick$={send}>Send</button>

        <div>
          <ElmAgUiMessageRenderer
            messages={agent.messages}
            events={agent.events}
          />
        </div>
      </div>
    );
  },
);
