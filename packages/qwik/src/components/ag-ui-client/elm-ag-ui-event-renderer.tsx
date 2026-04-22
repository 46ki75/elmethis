import { component$, JSX, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-ag-ui-event-renderer.module.css";
import {
  BaseEvent,
  EventType,
  InputContent,
  MessagesSnapshotEvent,
  UserMessage,
} from "@ag-ui/core";
import { ElmBlockImage, ElmInlineText, ElmMdiIcon } from "../..";
import { mdiAccount } from "@mdi/js";

export interface ElmAgUiEventRendererProps {
  class?: string;

  style?: CSSProperties;

  events: BaseEvent[];
}

const renderInputContent = (content: InputContent) => {
  if (typeof content === "string") {
    return <ElmInlineText>{content}</ElmInlineText>;
  }

  switch (content.type) {
    case "audio": {
      break;
    }

    // Deprecated: previous Python-specific type that has since been
    // replaced by the more explicit typed variants
    // `ImageInputContent`, `AudioInputContent`.
    case "binary": {
      break;
    }

    // Uploaded Files
    case "document": {
      break;
    }

    case "image": {
      const url =
        content.source.type === "url"
          ? content.source.value
          : URL.createObjectURL(
              new Blob([atob(content.source.value)], {
                type: content.source.mimeType,
              }),
            );
      return <ElmBlockImage src={url} />;
    }

    case "video": {
      break;
    }

    case "text": {
      return <ElmInlineText>{content.text}</ElmInlineText>;
    }
  }
};

export const ElmAgUiEventRenderer = component$<ElmAgUiEventRendererProps>(
  ({ class: className, style, events }) => {
    const render = (events: BaseEvent[]): JSX.Element[] => {
      const messageSnapshot = events.findLast(
        (e) => e.type === EventType.MESSAGES_SNAPSHOT,
      ) as MessagesSnapshotEvent;

      const { messages } = messageSnapshot;
      const userMessages = messages.filter(
        (m) => m.role === "user" && m.content != null,
      ) as UserMessage[];

      const components: JSX.Element[] = [];
      let userMessageIndex = 0;

      for (const event of events) {
        switch (event.type) {
          case EventType.RUN_STARTED: {
            // Render user input messages
            const contents = userMessages[userMessageIndex]
              .content as InputContent[];

            const userInputComponent = (
              <div class={styles["message-content-user-wrapper"]}>
                <div class={styles["message-content-user-inner"]}>
                  <div class={styles["message-content-type"]}>
                    <ElmMdiIcon
                      class={styles["message-content-icon"]}
                      d={mdiAccount}
                    />
                    <ElmInlineText>User</ElmInlineText>
                    <div
                      aria-hidden="true"
                      class={styles["message-content-spacer"]}
                    ></div>
                  </div>

                  <div class={styles["message-content-user-content"]}>
                    {typeof contents === "string" ? (
                      <ElmInlineText>{contents}</ElmInlineText>
                    ) : (
                      contents.map((item, i) => (
                        <span key={i}>{renderInputContent(item)}</span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            );

            components.push(userInputComponent);
            userMessageIndex++;

            break;
          }

          case EventType.MESSAGES_SNAPSHOT: {
            break;
          }
        }
      }

      return components;
    };

    return (
      <div class={[styles["elm-my-something"], className]} style={style}>
        {render(events)}
      </div>
    );
  },
);
