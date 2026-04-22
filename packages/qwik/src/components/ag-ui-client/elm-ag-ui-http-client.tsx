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
  HttpAgent,
  Message,
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
        const subscription = httpAgent.value?.subscribe({
          onEvent({ messages: newMessages, event }) {
            if (agent.messages.length < newMessages.length) {
              agent.messages.push(...newMessages.slice(agent.messages.length));
            }
            const events = [...agent.events, event];
            agent.events = compactEvents(events);
            console.info(event);
          },
          onTextMessageContentEvent({ event }) {
            const incomingContent = event.delta;

            const lastAssistantMessageRef = agent.messages.findLast(
              (msg) => msg.role === "assistant",
            );
            if (lastAssistantMessageRef && incomingContent) {
              lastAssistantMessageRef.content =
                lastAssistantMessageRef.content + incomingContent;
            }
          },
          onRunFinalized({ messages }) {
            console.info(messages);
            console.info(agent.events);
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
          content: "What is a new feature called Amazon S3 Files?",
        });

        await httpAgent.value.runAgent({});
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
