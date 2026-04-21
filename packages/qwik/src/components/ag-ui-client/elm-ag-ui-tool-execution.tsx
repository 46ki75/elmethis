import {
  $,
  component$,
  useSignal,
  useTask$,
  type CSSProperties,
} from "@builder.io/qwik";

import styles from "./elm-ag-ui-tool-execution.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiCodeJson, mdiHammerScrewdriver } from "@mdi/js";
import { ElmInlineText } from "../typography/elm-inline-text";
import { EventType } from "@ag-ui/core";
import { ElmCodeBlock } from "../code/elm-code-block";
import { ElmToggle } from "../containments/elm-toggle";

type ToolEventType =
  | EventType.TOOL_CALL_START
  | EventType.TOOL_CALL_ARGS
  | EventType.TOOL_CALL_END
  | EventType.TOOL_CALL_CHUNK
  | EventType.TOOL_CALL_RESULT;

export interface ElmAgUiToolExecutionProps {
  class?: string;

  style?: CSSProperties;

  toolName: string;

  toolEventType?: ToolEventType;

  toolCallArgs?: string;

  toolCallResult?: string;
}

export const ElmAgUiToolExecution = component$<ElmAgUiToolExecutionProps>(
  ({
    class: className,
    style,
    toolName,
    toolEventType,
    toolCallArgs,
    toolCallResult,
  }) => {
    const isOpen = useSignal<boolean>(true);
    const isArgsOpen = useSignal<boolean>(true);
    const isResultOpen = useSignal<boolean>(true);

    const isArgsShown = useSignal<boolean>(false);
    const isResultShown = useSignal<boolean>(false);

    useTask$(({ track }) => {
      const eventType = track(() => toolEventType);

      switch (eventType) {
        case EventType.TOOL_CALL_START:
          isOpen.value = true;
          isArgsShown.value = true;
          isArgsOpen.value = false;
          isResultShown.value = false;
          isResultOpen.value = false;
          break;
        case EventType.TOOL_CALL_ARGS:
          isOpen.value = true;
          isArgsShown.value = true;
          isArgsOpen.value = true;
          isResultShown.value = false;
          isResultOpen.value = false;
          break;
        case EventType.TOOL_CALL_END:
        case EventType.TOOL_CALL_CHUNK:
          isOpen.value = true;
          isArgsShown.value = true;
          isArgsOpen.value = false;
          isResultShown.value = true;
          isResultOpen.value = false;
          break;
        case EventType.TOOL_CALL_RESULT:
          isOpen.value = false;
          isArgsShown.value = true;
          isArgsOpen.value = false;
          isResultShown.value = true;
          isResultOpen.value = true;
          break;
      }
    });

    const toggleIsOpen = $(() => {
      isOpen.value = !isOpen.value;
    });

    const toggleIsArgsOpen = $(() => {
      isArgsOpen.value = !isArgsOpen.value;
    });

    const toggleIsResultOpen = $(() => {
      isResultOpen.value = !isResultOpen.value;
    });

    return (
      <div
        class={[styles["elm-ag-ui-tool-execution"], className]}
        style={style}
      >
        <ElmToggle isOpen={isOpen.value}>
          <div q:slot="summary" class={styles.summary} onClick$={toggleIsOpen}>
            <ElmMdiIcon d={mdiHammerScrewdriver} size="1.25rem" />
            <ElmInlineText>{toolName}</ElmInlineText>
          </div>

          {isArgsShown.value && (
            <ElmToggle isOpen={isArgsOpen.value}>
              <div
                q:slot="summary"
                class={styles.summary}
                onClick$={toggleIsArgsOpen}
              >
                <ElmMdiIcon d={mdiCodeJson} size="1.25rem" />
                <ElmInlineText>Args</ElmInlineText>
              </div>

              {toolCallArgs && (
                <ElmCodeBlock language="json" code={toolCallArgs} />
              )}
            </ElmToggle>
          )}

          {isResultShown.value && (
            <ElmToggle isOpen={isResultOpen.value}>
              <div
                q:slot="summary"
                class={styles.summary}
                onClick$={toggleIsResultOpen}
              >
                <ElmMdiIcon d={mdiCodeJson} size="1.25rem" />
                <ElmInlineText>Result</ElmInlineText>
              </div>

              {toolCallResult && (
                <ElmCodeBlock language="json" code={toolCallResult} />
              )}
            </ElmToggle>
          )}
        </ElmToggle>
      </div>
    );
  },
);
