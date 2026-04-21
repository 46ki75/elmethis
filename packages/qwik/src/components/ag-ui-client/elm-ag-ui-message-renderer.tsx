import { component$, JSX, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-ag-ui-message-renderer.module.css";
import { Message, InputContent } from "@ag-ui/core";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmBlockImage } from "../media/elm-block-image";
import { ElmMarkdown } from "../others/elm-markdown";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiAccount, mdiCreation } from "@mdi/js";
import { ElmCodeBlock } from "../code/elm-code-block";

export interface ElmAgUiMessageRendererProps {
  class?: string;

  style?: CSSProperties;

  messages: Message[];
}

export const ElmAgUiMessageRenderer = component$<ElmAgUiMessageRendererProps>(
  ({ class: className, style, messages }) => {
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

    const render = (message: Message): JSX.Element | null => {
      switch (message.role) {
        case "activity": {
          return null;
        }

        case "assistant": {
          if (message.content != null) {
            return (
              <div class={styles["message-content-assistant-wrapper"]}>
                <div class={styles["message-content-type"]}>
                  <ElmMdiIcon
                    class={styles["message-content-icon"]}
                    d={mdiCreation}
                  />
                  <ElmInlineText>Assistant</ElmInlineText>
                  <div
                    aria-hidden="true"
                    class={styles["message-content-spacer"]}
                  ></div>
                </div>

                <ElmMarkdown markdown={message.content} streaming={true} />
              </div>
            );
          }

          return null;
        }

        case "developer": {
          return null;
        }

        case "reasoning": {
          return null;
        }

        case "system": {
          return null;
        }

        case "tool": {
          return (
            <>
              <div>
                <ElmCodeBlock
                  language="json"
                  code={JSON.stringify(JSON.parse(message.content), null, 2)}
                />
              </div>
            </>
          );
        }

        case "user": {
          return (
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
                  {typeof message.content === "string" ? (
                    <ElmInlineText>{message.content}</ElmInlineText>
                  ) : (
                    message.content.map((item, i) => (
                      <span key={i}>{renderInputContent(item)}</span>
                    ))
                  )}
                </div>
              </div>
            </div>
          );
        }
      }
    };

    return (
      <div class={[styles["elm-my-something"], className]} style={style}>
        {messages.map((msg, i) => (
          <div key={msg.id ?? i}>{render(msg)}</div>
        ))}
      </div>
    );
  },
);
