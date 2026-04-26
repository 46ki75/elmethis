import { component$, JSX, QRL, type CSSProperties } from "@builder.io/qwik";

import styles from "./elm-ag-ui-message-renderer.module.css";
import {
  ActivityMessage,
  Message,
  InputContent,
  EventType,
  ToolCallResultEvent,
  ToolCall,
} from "@ag-ui/core";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmBlockImage } from "../media/elm-block-image";
import { ElmMarkdown } from "../others/elm-markdown";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiAccount, mdiCreation, mdiLightbulbOn, mdiRefresh } from "@mdi/js";
import { ElmAgUiToolExecution } from "./elm-ag-ui-tool-execution";
import { ElmCopyIcon } from "../icon/elm-copy-icon";
import { ElmToggle } from "../containments/elm-toggle";
import { ElmA2uiRenderer } from "../a2ui/elm-a2ui-renderer";

export interface ElmAgUiMessageRendererProps {
  class?: string;

  style?: CSSProperties;

  handleRetry$: QRL<() => void>;

  isRunning: boolean;

  messages: Message[];
}

export const ElmAgUiMessageRenderer = component$<ElmAgUiMessageRendererProps>(
  ({ class: className, style, messages, isRunning, handleRetry$ }) => {
    const renderTool = (toolCall: ToolCall, messages: Message[]) => {
      let toolEventType = EventType.TOOL_CALL_START;

      if (toolCall.function.arguments != null)
        toolEventType = EventType.TOOL_CALL_ARGS;

      const toolCallResultEvent = messages.find(
        (message) =>
          message.role === "tool" &&
          message.toolCallId === toolCall.id &&
          message.content != null,
      ) as ToolCallResultEvent | undefined;

      if (toolCallResultEvent?.content != null)
        toolEventType = EventType.TOOL_CALL_RESULT;

      return (
        <ElmAgUiToolExecution
          toolName={toolCall.function.name}
          toolEventType={toolEventType}
          toolCallArgs={toolCall.function.arguments}
          toolCallResult={toolCallResultEvent?.content}
        />
      );
    };

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

    const render = (message: Message, index: number): JSX.Element | null => {
      switch (message.role) {
        case "activity": {
          const activity = message as ActivityMessage;
          if (activity.activityType === "a2ui-surface") {
            const ops = activity.content["a2ui_operations"] as unknown[];
            return <ElmA2uiRenderer messages={ops} />;
          }
          return null;
        }

        case "assistant": {
          if (message.content != null || message.toolCalls?.length) {
            return (
              <>
                {message.toolCalls?.map((toolCall) =>
                  renderTool(toolCall, messages),
                )}

                {message.content != null && (
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

                    {!isRunning && (
                      <div class={styles["message-content-assistant-actions"]}>
                        <ElmCopyIcon content={message.content} />

                        <span
                          class={styles["clickable-icon"]}
                          onClick$={handleRetry$}
                        >
                          <ElmMdiIcon d={mdiRefresh} size="1.25rem" />
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </>
            );
          }

          return null;
        }

        case "developer": {
          return null;
        }

        case "reasoning": {
          const Reasoning = component$(
            ({ isOpen, markdown }: { isOpen: boolean; markdown: string }) => {
              return (
                <ElmToggle isOpen={isOpen} monochrome>
                  <div q:slot="summary" class={styles["message-content-type"]}>
                    <ElmMdiIcon
                      class={styles["message-content-icon"]}
                      d={mdiLightbulbOn}
                    />
                    <ElmInlineText>Reasoning</ElmInlineText>
                    <div
                      aria-hidden="true"
                      class={styles["message-content-spacer"]}
                    ></div>
                  </div>

                  <ElmMarkdown
                    style={{ opacity: 0.5 }}
                    markdown={markdown}
                    streaming={true}
                  />
                </ElmToggle>
              );
            },
          );

          return (
            <Reasoning
              isOpen={messages.length - 1 === index}
              markdown={message.content}
            />
          );
        }

        case "system": {
          return null;
        }

        case "tool": {
          // Tool messages are rendered within the assistant message that triggered the tool call,
          // so we can skip rendering them here in the main message loop
          return null;
        }

        case "user": {
          const contentToText = () => {
            if (typeof message.content === "string") return message.content;

            if (Array.isArray(message.content)) {
              return message.content
                .map((item) =>
                  typeof item === "string"
                    ? item
                    : item.type === "text"
                      ? item.text
                      : "",
                )
                .join(" ");
            }

            return "";
          };

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

                <div>
                  <ElmCopyIcon content={contentToText()} />
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
          <div key={msg.id ?? i}>{render(msg, i)}</div>
        ))}
      </div>
    );
  },
);
