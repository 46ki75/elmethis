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
import { ElmCollapse } from "../containments/elm-collapse";
import { EventType } from "@ag-ui/core";
import { ElmCodeBlock } from "../code/elm-code-block";

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
}

export const ElmAgUiToolExecution = component$<ElmAgUiToolExecutionProps>(
  ({ class: className, style, toolName, toolEventType, toolCallArgs }) => {
    const toolCallArgsSignal = useSignal<string | undefined>(toolCallArgs);

    const isOpen = useSignal<boolean>(true);
    const isArgsOpen = useSignal<boolean>(true);
    // const isResultOpen = useSignal<boolean>(false);

    useTask$(({ track }) => {
      const eventType = track(() => toolEventType);

      switch (eventType) {
        case EventType.TOOL_CALL_START:
          isOpen.value = true;
          isArgsOpen.value = false;
          break;
        case EventType.TOOL_CALL_ARGS:
          isOpen.value = true;
          isArgsOpen.value = true;
          break;
        case EventType.TOOL_CALL_END:
        case EventType.TOOL_CALL_CHUNK:
          isOpen.value = true;
          isArgsOpen.value = false;
          break;
        case EventType.TOOL_CALL_RESULT:
          isOpen.value = false;
          break;
      }
    });

    const toggleIsOpen = $(() => {
      isOpen.value = !isOpen.value;
    });

    const toggleIsArgsOpen = $(() => {
      isArgsOpen.value = !isArgsOpen.value;
    });

    // const toggleIsResultOpen = $(() => {
    //   isResultOpen.value = !isResultOpen.value;
    // });

    return (
      <div
        class={[styles["elm-ag-ui-tool-execution"], className]}
        style={style}
      >
        <div class={styles["summary"]} onClick$={toggleIsOpen}>
          <ElmMdiIcon d={mdiHammerScrewdriver} />
          <ElmInlineText>{toolName}</ElmInlineText>
        </div>

        <ElmCollapse isOpen={isOpen.value}>
          <div>
            <div class={styles["summary"]} onClick$={toggleIsArgsOpen}>
              <ElmMdiIcon d={mdiCodeJson} />
              <ElmInlineText>Args</ElmInlineText>
            </div>

            <ElmCollapse isOpen={toolCallArgsSignal.value != null}>
              <ElmCodeBlock
                language="json"
                code={toolCallArgsSignal.value || ""}
              />
            </ElmCollapse>
          </div>
        </ElmCollapse>
      </div>
    );
  },
);
