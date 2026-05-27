import {
  $,
  component$,
  QRL,
  useSignal,
  useVisibleTask$,
  type ClassList,
  type CSSProperties,
} from "@qwik.dev/core";
import { mdiAlert, mdiForumOutline, mdiRefresh } from "@mdi/js";
import type { InputContent } from "@ag-ui/client";

import styles from "./elm-ag-ui-agent.module.css";

import { ElmAgUiMessageRenderer } from "./elm-ag-ui-message-renderer";
import { ElmAgUiInput } from "./elm-ag-ui-input";
import type { ElmAgUiPromptDescriptor } from "./elm-ag-ui-prompt-picker";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import type { AgentState } from "./use-agent";

export interface ElmAgUiAgentProps {
  state: AgentState;
  send$: QRL<(content: InputContent[]) => Promise<void> | void>;
  retry$: QRL<() => Promise<void> | void>;
  abort$: QRL<() => void>;
  /**
   * @default "clamp(300px, 100%, 600px)"
   */
  width?: CSSProperties["width"];
  enableAutoScroll?: boolean;
  class?: ClassList;
  style?: CSSProperties;
  /**
   * Prompts exposed via a "+" button at the left of the input. Pair
   * with `resolvePrompt$` to integrate MCP prompts or any other
   * prompt source.
   */
  prompts?: ElmAgUiPromptDescriptor[];
  /**
   * Resolve a picked prompt with the user-supplied argument values
   * into `InputContent[]`. The text blocks are inserted into the
   * textarea at the current cursor position so the user can edit
   * before submitting. Return `null` (or content with no text blocks)
   * to leave the textarea untouched.
   */
  resolvePrompt$?: QRL<
    (
      key: string,
      args: Record<string, string>,
    ) => Promise<InputContent[] | null>
  >;
}

export const ElmAgUiAgent = component$<ElmAgUiAgentProps>((props) => {
  const {
    state,
    send$,
    retry$,
    abort$,
    width = "clamp(300px, 100%, 600px)",
    class: className,
    style,
    prompts,
    resolvePrompt$,
  } = props;

  const input = useSignal("");
  const containerRef = useSignal<HTMLElement>();
  const lastScrollTime = useSignal(0);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ track }) => {
      track(() => state.messages.length);
      // Read via `props.*` (not a destructured local) so Qwik can trace the
      // closure capture back to a reactive, serializable source.
      if (props.enableAutoScroll) {
        const now = Date.now();
        if (now - lastScrollTime.value < 500) return;
        lastScrollTime.value = now;
        containerRef.value?.scrollTo({
          behavior: "smooth",
          top: containerRef.value.scrollHeight,
        });
      }
    },
    { strategy: "document-ready" },
  );

  const onTemplateClick$ = $((_event: Event, element: Element) => {
    const idx = Number(element.getAttribute("data-template-index"));
    if (Number.isNaN(idx)) return;
    // Spread each item to create plain objects — HttpAgent calls
    // structuredClone() on messages before sending, which throws a
    // DataCloneError on Qwik reactive store proxies.
    send$(
      state.promptTemplates[idx].content.map(
        (item) => ({ ...item }) as InputContent,
      ),
    );
  });

  const onInput$ = $((_event: InputEvent, element: HTMLTextAreaElement) => {
    input.value = element.value;
  });

  const onSubmit$ = $((_event: Event, element: Element) => {
    if (input.value.trim() === "") return;
    send$([{ type: "text", text: input.value }]);
    input.value = "";
    const textarea = element.querySelector("textarea");
    if (textarea) textarea.value = "";
  });

  return (
    <div
      ref={containerRef}
      class={[styles["use-agent"], className]}
      style={{
        "--agent-ui-width": width,
        ...style,
      }}
    >
      <div class={styles["agent-container"]}>
        <div class={styles["messages"]}>
          <ElmAgUiMessageRenderer
            isRunning={state.isRunning}
            messages={state.messages}
            handleRetry$={retry$}
          />

          {state.error && (
            <>
              <div class={styles["error"]}>
                <ElmMdiIcon
                  d={mdiAlert}
                  color="var(--elmethis-accent-error)"
                  style={{ flexShrink: 0 }}
                />
                <ElmInlineText color="var(--elmethis-accent-error)">
                  {state.error}
                </ElmInlineText>
              </div>

              <span class={styles["clickable-icon"]} onClick$={retry$}>
                <ElmMdiIcon d={mdiRefresh} size="1.25rem" />
              </span>
            </>
          )}
        </div>
      </div>

      <div class={styles["agent-input-container"]}>
        <div class={styles["agent-input"]}>
          {!state.isRunning && (
            <div class={styles["prompt-template-container"]}>
              {state.promptTemplates.map((template, index) => (
                <span
                  key={index}
                  data-template-index={index}
                  class={styles["prompt-template-tip"]}
                  onClick$={onTemplateClick$}
                >
                  <ElmMdiIcon
                    class={styles["prompt-template-tip-icon"]}
                    d={mdiForumOutline}
                  />
                  <ElmInlineText>{template.description}</ElmInlineText>
                </span>
              ))}
            </div>
          )}

          <ElmAgUiInput
            onInput$={onInput$}
            onSubmit$={onSubmit$}
            onAbort$={abort$}
            isRunning={state.isRunning}
            prompts={prompts}
            resolvePrompt$={resolvePrompt$}
          />
        </div>
      </div>
    </div>
  );
});
