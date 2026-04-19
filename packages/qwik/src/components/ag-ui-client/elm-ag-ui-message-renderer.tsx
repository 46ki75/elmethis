import { component$, JSX } from "@builder.io/qwik";

import styles from "./elm-ag-ui-message-renderer.module.css";
import { Message, InputContent } from "@ag-ui/core";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmBlockImage } from "../media/elm-block-image";
import { ElmMarkdown } from "../others/elm-markdown";

export interface ElmAgUiMessageRendererProps {
  messages: Message[];
}

export const ElmAgUiMessageRenderer = component$<ElmAgUiMessageRendererProps>(
  ({ messages }) => {
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
            return <ElmMarkdown markdown={message.content} />;
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
          return null;
        }

        case "user": {
          if (typeof message.content === "string") {
            return <ElmInlineText>{message.content}</ElmInlineText>;
          } else {
            return message.content.map((item) => renderInputContent(item));
          }
        }
      }
    };

    return <div class={styles["elm-my-something"]}>{messages.map(render)}</div>;
  },
);
