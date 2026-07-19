import {
  createEffect,
  createSignal,
  For,
  Show,
  splitProps,
  type JSX,
} from "solid-js";
import { clsx } from "clsx";
import {
  mdiAlert,
  mdiClockOutline,
  mdiClose,
  mdiForumOutline,
  mdiRefresh,
} from "@mdi/js";
import type { InputContent } from "@ag-ui/client";

import type { AgentState } from "../hooks/use-agent";
import { ElmMdiIcon } from "../../icon/elm-mdi-icon";
import { ElmInlineText } from "../../typography/elm-inline-text";
import { mergeStyle } from "../../../styles/merge-style";
import { ElmAgUiInput } from "./elm-ag-ui-input";
import { ElmAgUiMessageRenderer } from "./elm-ag-ui-message-renderer";
import type { ElmAgUiPromptDescriptor } from "./elm-ag-ui-prompt-picker";
import styles from "./elm-ag-ui-agent.module.css";

export interface ElmAgUiAgentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  state: AgentState;
  send: (content: InputContent[]) => Promise<void> | void;
  retry: () => Promise<void> | void;
  abort: () => void;
  dequeue: (id: string) => void;
  width?: JSX.CSSProperties["width"];
  enableAutoScroll?: boolean;
  enableToolCalls?: boolean;
  enableReasoning?: boolean;
  prompts?: ElmAgUiPromptDescriptor[];
  resolvePrompt?: (
    key: string,
    args: Record<string, string>,
  ) => Promise<InputContent[] | null>;
}

const queuePreview = (content: InputContent[]): string => {
  const textBlock = content.find(
    (block): block is { type: "text"; text: string } => block.type === "text",
  );
  return textBlock?.text ?? "Attachment";
};

export const ElmAgUiAgent = (props: ElmAgUiAgentProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "style",
    "children",
    "state",
    "send",
    "retry",
    "abort",
    "dequeue",
    "width",
    "enableAutoScroll",
    "enableToolCalls",
    "enableReasoning",
    "prompts",
    "resolvePrompt",
  ]);
  const [input, setInput] = createSignal("");
  let containerRef!: HTMLDivElement;
  let lastScrollTime = 0;

  createEffect(() => {
    if (local.state.messages.length === 0 || !local.enableAutoScroll) return;
    const now = Date.now();
    if (now - lastScrollTime < 500) return;
    lastScrollTime = now;
    containerRef?.scrollTo({
      behavior: "smooth",
      top: containerRef.scrollHeight,
    });
  });

  const submit = () => {
    if (!input().trim()) return;
    void local.send([{ type: "text", text: input() }]);
    setInput("");
  };

  return (
    <div
      {...rest}
      ref={(element) => {
        containerRef = element;
      }}
      class={clsx(styles["elm-ag-ui-agent"], local.class)}
      style={mergeStyle(local.style, {
        "--elmethis-scoped-agent-ui-width":
          local.width ?? "clamp(300px, 100%, 600px)",
      } as JSX.CSSProperties)}
    >
      <div class={styles["agent-container"]}>
        <div class={styles.messages}>
          <ElmAgUiMessageRenderer
            isRunning={local.state.isRunning}
            messages={local.state.messages}
            handleRetry={() => void local.retry()}
            enableToolCalls={local.enableToolCalls ?? true}
            enableReasoning={local.enableReasoning ?? true}
          />
          <Show when={local.state.error} keyed>
            {(error) => (
              <>
                <div class={styles.error}>
                  <ElmMdiIcon
                    d={mdiAlert}
                    color="var(--elmethis-color-accent-error)"
                    style={{ "flex-shrink": 0 }}
                  />
                  <ElmInlineText color="var(--elmethis-color-accent-error)">
                    {error}
                  </ElmInlineText>
                </div>
                <button
                  type="button"
                  class={styles["clickable-icon"]}
                  onClick={() => void local.retry()}
                  aria-label="Retry"
                >
                  <ElmMdiIcon d={mdiRefresh} size="1.25rem" />
                </button>
              </>
            )}
          </Show>
        </div>
      </div>

      <div class={styles["agent-input-container"]}>
        <div class={styles["agent-input"]}>
          <Show when={local.state.queue.length > 0}>
            <div class={styles["queue-container"]}>
              <For each={local.state.queue}>
                {(queued) => (
                  <div class={styles["queue-item"]}>
                    <ElmMdiIcon
                      class={styles["queue-item-icon"]}
                      d={mdiClockOutline}
                      size="1rem"
                    />
                    <span class={styles["queue-item-text"]}>
                      <ElmInlineText>
                        {queuePreview(queued.content)}
                      </ElmInlineText>
                    </span>
                    <button
                      type="button"
                      class={styles["queue-item-remove"]}
                      onClick={() => local.dequeue(queued.id)}
                      aria-label="Remove from queue"
                    >
                      <ElmMdiIcon d={mdiClose} size="0.875rem" />
                    </button>
                  </div>
                )}
              </For>
            </div>
          </Show>

          <Show when={!local.state.isRunning}>
            <div class={styles["prompt-template-container"]}>
              <For each={local.state.promptTemplates}>
                {(template) => (
                  <button
                    type="button"
                    class={styles["prompt-template-tip"]}
                    onClick={() =>
                      void local.send(
                        template.content.map(
                          (item) => ({ ...item }) as InputContent,
                        ),
                      )
                    }
                  >
                    <ElmMdiIcon
                      class={styles["prompt-template-tip-icon"]}
                      d={mdiForumOutline}
                    />
                    <ElmInlineText>{template.description}</ElmInlineText>
                  </button>
                )}
              </For>
            </div>
          </Show>

          <ElmAgUiInput
            onInputChange={(_event, element) => setInput(element.value)}
            onSubmit={submit}
            onAbort={local.abort}
            isRunning={local.state.isRunning}
            status={local.state.status}
            activity={local.state.activity}
            prompts={local.prompts}
            resolvePrompt={local.resolvePrompt}
          />
        </div>
      </div>
    </div>
  );
};
