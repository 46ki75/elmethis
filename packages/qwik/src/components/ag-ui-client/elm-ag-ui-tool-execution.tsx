import {
  $,
  component$,
  useSignal,
  useVisibleTask$,
  type CSSProperties,
} from "@builder.io/qwik";

import styles from "./elm-ag-ui-tool-execution.module.css";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import {
  mdiCodeJson,
  mdiFunctionVariant,
  mdiHammerScrewdriver,
  mdiWrenchClock,
} from "@mdi/js";
import { ElmInlineText } from "../typography/elm-inline-text";
import { EventType } from "@ag-ui/core";
import { ElmCodeBlock } from "../code/elm-code-block";
import { ElmToggle } from "../containments/elm-toggle";
import { useThrottledQueue } from "../../hooks/useThrottledQueue";

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
    const isOpen = useSignal<boolean>(false);
    const isArgsShown = useSignal<boolean>(false);
    const isArgsOpen = useSignal<boolean>(false);
    const isResultShown = useSignal<boolean>(false);
    const isResultOpen = useSignal<boolean>(false);

    const queue = useThrottledQueue(200);

    // eslint-disable-next-line qwik/no-use-visible-task
    useVisibleTask$(({ track }) => {
      const eventType = track(() => toolEventType);

      switch (eventType) {
        case EventType.TOOL_CALL_START:
          queue.value?.push(async () => {
            isOpen.value = true;
            isArgsShown.value = true;
            isArgsOpen.value = false;
            isResultShown.value = false;
            isResultOpen.value = false;
          });
          break;
        case EventType.TOOL_CALL_ARGS:
          queue.value?.push(async () => {
            isOpen.value = true;
            isArgsShown.value = true;
            isArgsOpen.value = true;
            isResultShown.value = false;
            isResultOpen.value = false;
          });
          queue.value?.push(async () => {
            isArgsOpen.value = false;
          });
          break;
        case EventType.TOOL_CALL_END:
        case EventType.TOOL_CALL_CHUNK:
          queue.value?.push(async () => {
            isOpen.value = true;
            isArgsShown.value = true;
            isArgsOpen.value = false;
            isResultShown.value = true;
            isResultOpen.value = false;
          });
          break;
        case EventType.TOOL_CALL_RESULT:
          queue.value?.push(async () => {
            isArgsShown.value = true;
            isArgsOpen.value = false;
            isResultShown.value = true;
            isResultOpen.value = true;
          });
          queue.value?.push(async () => {
            isOpen.value = false;
            isResultOpen.value = false;
          });
          break;
      }
    });

    const setIsOpen = $((v: boolean) => {
      isOpen.value = v;
    });

    const setIsArgsOpen = $((v: boolean) => {
      isArgsOpen.value = v;
    });

    const setIsResultOpen = $((v: boolean) => {
      isResultOpen.value = v;
    });

    return (
      <div
        class={[styles["elm-ag-ui-tool-execution"], className]}
        style={{ "--margin-block": "0", ...style }}
      >
        <ElmToggle isOpen={isOpen.value} setIsOpen$={setIsOpen}>
          <div q:slot="summary" class={styles.summary}>
            <ElmMdiIcon d={mdiHammerScrewdriver} size="1.25rem" />
            <ElmInlineText>{toolName}</ElmInlineText>
          </div>

          {
            <div class={styles.summary}>
              <ElmMdiIcon
                d={mdiFunctionVariant}
                size="1.25rem"
                color={
                  toolEventType === EventType.TOOL_CALL_START
                    ? "#6987b8"
                    : "#59b57c"
                }
              />
              <ElmInlineText>Preparing arguments...</ElmInlineText>
            </div>
          }

          {isArgsShown.value && (
            <ElmToggle isOpen={isArgsOpen.value} setIsOpen$={setIsArgsOpen}>
              <div
                q:slot="summary"
                class={styles.summary}
              >
                <ElmMdiIcon d={mdiCodeJson} size="1.25rem" />
                <ElmInlineText>Args</ElmInlineText>
              </div>

              {toolCallArgs != null && (
                <ElmCodeBlock language="json" code={toolCallArgs} />
              )}
            </ElmToggle>
          )}

          {toolEventType === EventType.TOOL_CALL_START ? null : (
            <div class={styles.summary}>
              <ElmMdiIcon
                d={mdiWrenchClock}
                size="1.25rem"
                color={
                  toolEventType === EventType.TOOL_CALL_ARGS ||
                  toolEventType === EventType.TOOL_CALL_END
                    ? "#6987b8"
                    : "#59b57c"
                }
              />
              <ElmInlineText>
                {toolEventType === EventType.TOOL_CALL_ARGS ||
                toolEventType === EventType.TOOL_CALL_END
                  ? "Executing..."
                  : "Execution completed"}
              </ElmInlineText>
            </div>
          )}

          {isResultShown.value && (
            <ElmToggle isOpen={isResultOpen.value} setIsOpen$={setIsResultOpen}>
              <div
                q:slot="summary"
                class={styles.summary}
              >
                <ElmMdiIcon d={mdiCodeJson} size="1.25rem" />
                <ElmInlineText>Result</ElmInlineText>
              </div>

              {toolCallResult != null && (
                <ElmCodeBlock language="json" code={toolCallResult} />
              )}
            </ElmToggle>
          )}
        </ElmToggle>
      </div>
    );
  },
);
