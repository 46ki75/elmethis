import {
  $,
  component$,
  NoSerialize,
  noSerialize,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";

import styles from "./elm-ag-ui-http-client.module.css";

// AG-UI
import { HttpAgent, randomUUID } from "@ag-ui/client";

export interface ElmAgUiHttpClientProps {
  url: string;
}

export const ElmAgUiHttpClient = component$<ElmAgUiHttpClientProps>(
  ({ url }) => {
    const agent = useSignal<NoSerialize<HttpAgent> | null>(null);

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ cleanup }) => {
      if (!agent.value) {
        agent.value = noSerialize(
          new HttpAgent({
            url,
            // headers: {
            //   Authorization: "Bearer your-api-key",
            // },
          }),
        );

        cleanup(() => {
          agent.value = null;
        });
      }

      if (agent.value) {
        const subscription = agent.value?.subscribe({
          onTextMessageContentEvent({ textMessageBuffer }) {
            console.log(textMessageBuffer);
          },
          // onRunFinishedEvent({ result }) {
          //   displayFinalResult(result);
          // },
        });

        cleanup(() => {
          subscription.unsubscribe();
        });
      }
    });

    const send = $(async () => {
      if (agent.value) {
        agent.value.messages.push({
          id: randomUUID(),
          role: "user",
          content: "Hi!",
        });

        await agent.value.runAgent({});
      }
    });

    return (
      <div class={styles["elm-my-something"]}>
        <button onClick$={send}>Send</button>
      </div>
    );
  },
);
