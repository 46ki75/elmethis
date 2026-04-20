import {
  $,
  component$,
  NoSerialize,
  noSerialize,
  useSignal,
  useStore,
  useVisibleTask$,
} from "@builder.io/qwik";

import styles from "./elm-ag-ui-http-client.module.css";

// AG-UI
import { HttpAgent, Message, randomUUID } from "@ag-ui/client";
import { ElmAgUiMessageRenderer } from "./elm-ag-ui-message-renderer";

export interface ElmAgUiHttpClientProps {
  url: string;
}

export const ElmAgUiHttpClient = component$<ElmAgUiHttpClientProps>(
  ({ url }) => {
    const httpAgent = useSignal<NoSerialize<HttpAgent> | null>(null);

    const agent = useStore<{ messages: Message[] }>({ messages: [] });

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
            console.info(event);
          },
          onToolCallStartEvent({ event }) {
            console.log("Tool call started:", event);
          },
          onToolCallArgsEvent({ event }) {
            console.log("Tool call args:", event);
          },
          onToolCallResultEvent({ event }) {
            console.log("Tool call result:", event);
          },
          async onToolCallEndEvent({ event }) {
            console.log("Tool call ended:", event);
          },
          onTextMessageContentEvent({ messages: newMessages }) {
            const incomingContent = newMessages[newMessages.length - 1].content;

            if (incomingContent) {
              agent.messages[agent.messages.length - 1].content =
                incomingContent;
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
          content: "What is a new feature called Amazon S3 Files?",
        });

        await httpAgent.value.runAgent({});
      }
    });

    return (
      <div class={styles["elm-my-something"]}>
        <button onClick$={send}>Send</button>

        <div>
          <ElmAgUiMessageRenderer messages={agent.messages} />
        </div>
      </div>
    );
  },
);
