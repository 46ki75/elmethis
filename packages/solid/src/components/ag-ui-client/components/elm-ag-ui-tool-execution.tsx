import {
  createEffect,
  createSignal,
  Show,
  splitProps,
  type JSX,
} from "solid-js";
import { clsx } from "clsx";
import {
  mdiCodeJson,
  mdiFunctionVariant,
  mdiHammerScrewdriver,
  mdiWrenchClock,
} from "@mdi/js";
import { EventType } from "@ag-ui/core";

import { createThrottledQueue } from "../../../primitives/create-throttled-queue";
import { ElmShikiHighlighter } from "../../code/elm-shiki-highlighter";
import { ElmToggle } from "../../containments/elm-toggle";
import { ElmMdiIcon } from "../../icon/elm-mdi-icon";
import { ElmInlineText } from "../../typography/elm-inline-text";
import styles from "./elm-ag-ui-tool-execution.module.css";

type ToolEventType =
  | EventType.TOOL_CALL_START
  | EventType.TOOL_CALL_ARGS
  | EventType.TOOL_CALL_END
  | EventType.TOOL_CALL_CHUNK
  | EventType.TOOL_CALL_RESULT;

export interface ElmAgUiToolExecutionProps extends JSX.HTMLAttributes<HTMLDivElement> {
  toolName: string;
  toolEventType?: ToolEventType;
  toolCallArgs?: string;
  toolCallResult?: string;
}

export const ElmAgUiToolExecution = (props: ElmAgUiToolExecutionProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "toolName",
    "toolEventType",
    "toolCallArgs",
    "toolCallResult",
  ]);
  const [isOpen, setIsOpen] = createSignal(false);
  const [isArgsShown, setIsArgsShown] = createSignal(false);
  const [isArgsOpen, setIsArgsOpen] = createSignal(false);
  const [isResultShown, setIsResultShown] = createSignal(false);
  const [isResultOpen, setIsResultOpen] = createSignal(false);
  const queue = createThrottledQueue(200);
  let latestPhase = -1;
  const enqueue = (task: () => void) => {
    void queue.push(async () => task()).catch(() => undefined);
  };

  createEffect(() => {
    const eventType = local.toolEventType;
    const phase =
      eventType === EventType.TOOL_CALL_START
        ? 0
        : eventType === EventType.TOOL_CALL_ARGS
          ? 1
          : eventType === EventType.TOOL_CALL_END ||
              eventType === EventType.TOOL_CALL_CHUNK
            ? 2
            : eventType === EventType.TOOL_CALL_RESULT
              ? 3
              : -1;
    if (phase <= latestPhase) return;
    latestPhase = phase;

    switch (eventType) {
      case EventType.TOOL_CALL_START:
        enqueue(() => {
          setIsOpen(true);
          setIsArgsShown(true);
          setIsArgsOpen(false);
          setIsResultShown(false);
          setIsResultOpen(false);
        });
        break;
      case EventType.TOOL_CALL_ARGS:
        enqueue(() => {
          setIsOpen(true);
          setIsArgsShown(true);
          setIsArgsOpen(true);
          setIsResultShown(false);
          setIsResultOpen(false);
        });
        enqueue(() => setIsArgsOpen(false));
        break;
      case EventType.TOOL_CALL_END:
      case EventType.TOOL_CALL_CHUNK:
        enqueue(() => {
          setIsOpen(true);
          setIsArgsShown(true);
          setIsArgsOpen(false);
          setIsResultShown(true);
          setIsResultOpen(false);
        });
        break;
      case EventType.TOOL_CALL_RESULT:
        enqueue(() => {
          setIsArgsShown(true);
          setIsArgsOpen(false);
          setIsResultShown(true);
          setIsResultOpen(true);
        });
        enqueue(() => {
          setIsOpen(false);
          setIsResultOpen(false);
        });
        break;
    }
  });

  const summary = (
    icon: string,
    label: JSX.Element,
    color?: string,
  ): JSX.Element => (
    <div class={styles.summary}>
      <ElmMdiIcon d={icon} size="1rem" color={color} />
      <ElmInlineText>{label}</ElmInlineText>
    </div>
  );

  return (
    <div
      {...rest}
      class={clsx(styles["elm-ag-ui-tool-execution"], local.class)}
    >
      <ElmToggle
        isOpen={isOpen()}
        onOpenChange={setIsOpen}
        monochrome
        summary={summary(mdiHammerScrewdriver, local.toolName)}
      >
        {summary(
          mdiFunctionVariant,
          "Preparing arguments...",
          local.toolEventType === EventType.TOOL_CALL_START
            ? "var(--elmethis-color-accent-info)"
            : "var(--elmethis-color-accent-success)",
        )}
        <Show when={isArgsShown()}>
          <ElmToggle
            isOpen={isArgsOpen()}
            onOpenChange={setIsArgsOpen}
            monochrome
            summary={summary(mdiCodeJson, "Args")}
          >
            <Show when={local.toolCallArgs} keyed>
              {(args) => (
                <div class={styles["tool-args-results-wrapper"]}>
                  <ElmShikiHighlighter language="json" code={args} />
                </div>
              )}
            </Show>
          </ElmToggle>
        </Show>
        <Show when={local.toolEventType !== EventType.TOOL_CALL_START}>
          {summary(
            mdiWrenchClock,
            local.toolEventType === EventType.TOOL_CALL_ARGS ||
              local.toolEventType === EventType.TOOL_CALL_END
              ? "Executing..."
              : "Execution completed",
            local.toolEventType === EventType.TOOL_CALL_ARGS ||
              local.toolEventType === EventType.TOOL_CALL_END
              ? "var(--elmethis-color-accent-info)"
              : "var(--elmethis-color-accent-success)",
          )}
        </Show>
        <Show when={isResultShown()}>
          <ElmToggle
            isOpen={isResultOpen()}
            onOpenChange={setIsResultOpen}
            monochrome
            summary={summary(mdiCodeJson, "Result")}
          >
            <Show when={local.toolCallResult} keyed>
              {(result) => (
                <div class={styles["tool-args-results-wrapper"]}>
                  <ElmShikiHighlighter language="json" code={result} />
                </div>
              )}
            </Show>
          </ElmToggle>
        </Show>
      </ElmToggle>
    </div>
  );
};
