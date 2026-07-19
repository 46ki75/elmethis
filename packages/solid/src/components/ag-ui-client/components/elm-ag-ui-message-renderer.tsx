import {
  createEffect,
  createSignal,
  For,
  Show,
  splitProps,
  type JSX,
} from "solid-js";
import { clsx } from "clsx";
import { mdiAccount, mdiCreation, mdiLightbulbOn, mdiRefresh } from "@mdi/js";
import {
  EventType,
  type ActivityMessage,
  type Message,
  type ToolCall,
} from "@ag-ui/core";

import { ElmA2ui } from "../../a2ui/elm-a2ui";
import { ElmToggle } from "../../containments/elm-toggle";
import { ElmCopyIcon } from "../../icon/elm-copy-icon";
import { ElmMdiIcon } from "../../icon/elm-mdi-icon";
import { ElmMarkdown } from "../../others/elm-markdown";
import { ElmInlineText } from "../../typography/elm-inline-text";
import { ElmAgUiInputContent } from "./input-content/elm-ag-ui-input-content";
import { ElmAgUiToolExecution } from "./elm-ag-ui-tool-execution";
import styles from "./elm-ag-ui-message-renderer.module.css";

export interface ElmAgUiMessageRendererProps extends JSX.HTMLAttributes<HTMLDivElement> {
  handleRetry: () => void;
  isRunning: boolean;
  messages: Message[];
  enableToolCalls?: boolean;
  enableReasoning?: boolean;
}

interface ReasoningProps {
  isReasoningRunning: boolean;
  markdown: string;
}

const Reasoning = (props: ReasoningProps) => {
  const [isOpen, setIsOpen] = createSignal(false);
  let reasoningRef!: HTMLDivElement;
  let lastScrollTime = 0;

  createEffect(() => setIsOpen(props.isReasoningRunning));
  createEffect(() => {
    const markdown = props.markdown;
    if (!reasoningRef || markdown === "") return;
    const now = Date.now();
    if (now - lastScrollTime < 500) return;
    lastScrollTime = now;
    reasoningRef.scrollTo({
      behavior: "smooth",
      top: reasoningRef.scrollHeight,
    });
  });

  return (
    <ElmToggle
      isOpen={isOpen()}
      onOpenChange={setIsOpen}
      monochrome
      summary={
        <div class={styles["message-content-type"]}>
          <ElmMdiIcon
            class={styles["message-content-icon"]}
            d={mdiLightbulbOn}
          />
          <ElmInlineText>Reasoning</ElmInlineText>
          <div aria-hidden="true" class={styles["message-content-spacer"]} />
        </div>
      }
    >
      <div
        ref={(element) => {
          reasoningRef = element;
        }}
        class={clsx(props.isReasoningRunning && styles["reasoning-running"])}
      >
        <ElmMarkdown
          style={{ opacity: 0.5 }}
          markdown={props.markdown}
          isStreaming
        />
      </div>
    </ElmToggle>
  );
};

const contentToText = (message: Message): string => {
  if (typeof message.content === "string") return message.content;
  if (!Array.isArray(message.content)) return "";
  return message.content
    .map((item) =>
      typeof item === "string" ? item : item.type === "text" ? item.text : "",
    )
    .join(" ");
};

export const ElmAgUiMessageRenderer = (props: ElmAgUiMessageRendererProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "handleRetry",
    "isRunning",
    "messages",
    "enableToolCalls",
    "enableReasoning",
  ]);

  const renderTool = (toolCall: ToolCall) => {
    const result = () =>
      local.messages.find(
        (message) =>
          message.role === "tool" &&
          message.toolCallId === toolCall.id &&
          message.content != null,
      );
    const eventType = () => {
      if (result()?.content != null) return EventType.TOOL_CALL_RESULT;
      if (toolCall.function.arguments != null) return EventType.TOOL_CALL_ARGS;
      return EventType.TOOL_CALL_START;
    };
    const resultContent = () => {
      const content = result()?.content;
      return typeof content === "string" ? content : undefined;
    };
    return (
      <ElmAgUiToolExecution
        toolName={toolCall.function.name}
        toolEventType={eventType()}
        toolCallArgs={toolCall.function.arguments}
        toolCallResult={resultContent()}
      />
    );
  };

  const renderMessage = (
    message: Message,
    index: () => number,
  ): JSX.Element => {
    switch (message.role) {
      case "activity": {
        const activity = message as ActivityMessage;
        return activity.activityType === "a2ui-surface" ? (
          <ElmA2ui messages={activity.content["a2ui_operations"] as object[]} />
        ) : undefined;
      }
      case "assistant":
        return (
          <>
            <Show when={local.enableToolCalls !== false}>
              <For each={message.toolCalls}>{renderTool}</For>
            </Show>
            <Show when={message.content} keyed>
              {(content) => (
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
                    />
                  </div>
                  <ElmMarkdown markdown={content} isStreaming />
                  <Show when={!local.isRunning}>
                    <div class={styles["message-content-assistant-actions"]}>
                      <ElmCopyIcon content={content} />
                      <button
                        type="button"
                        class={styles["clickable-icon"]}
                        onClick={local.handleRetry}
                        aria-label="Retry"
                      >
                        <ElmMdiIcon d={mdiRefresh} size="1.25rem" />
                      </button>
                    </div>
                  </Show>
                </div>
              )}
            </Show>
          </>
        );
      case "reasoning":
        return (
          <Show when={local.enableReasoning !== false}>
            <Reasoning
              isReasoningRunning={local.messages.length - 1 === index()}
              markdown={message.content}
            />
          </Show>
        );
      case "user":
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
                />
              </div>
              <ElmAgUiInputContent inputContent={message.content} />
              <ElmCopyIcon content={contentToText(message)} />
            </div>
          </div>
        );
      case "developer":
      case "system":
      case "tool":
        return undefined;
    }
  };

  return (
    <div
      {...rest}
      class={clsx(styles["elm-ag-ui-message-renderer"], local.class)}
    >
      <For each={local.messages}>
        {(message, index) => <div>{renderMessage(message, index)}</div>}
      </For>
    </div>
  );
};
