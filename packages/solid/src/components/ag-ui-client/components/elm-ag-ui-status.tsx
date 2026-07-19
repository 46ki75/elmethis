import { createMemo, Show, splitProps, type JSX } from "solid-js";
import { clsx } from "clsx";
import {
  mdiAccountQuestionOutline,
  mdiAlertCircleOutline,
  mdiBrain,
  mdiCheckCircleOutline,
  mdiDotsHorizontalCircleOutline,
  mdiHammerScrewdriver,
  mdiPencil,
  mdiStopCircleOutline,
  mdiSync,
} from "@mdi/js";

import type {
  AgentActivity,
  AgentRunStatus,
} from "../internal/create-agent-subscriber";
import { ElmMdiIcon } from "../../icon/elm-mdi-icon";
import { ElmInlineText } from "../../typography/elm-inline-text";
import styles from "./elm-ag-ui-status.module.css";

export interface ElmAgUiStatusProps extends JSX.HTMLAttributes<HTMLDivElement> {
  status: AgentRunStatus;
  activity?: AgentActivity;
  label?: string;
}

interface StatusView {
  d: string;
  label: string;
  color?: string;
  pulse?: boolean;
}

const INFO = "var(--elmethis-color-accent-info)";
const SUCCESS = "var(--elmethis-color-accent-success)";
const ERROR = "var(--elmethis-color-accent-error)";

const activityView = (activity: AgentActivity): StatusView => {
  switch (activity) {
    case "thinking":
      return { d: mdiBrain, label: "Thinking...", color: INFO, pulse: true };
    case "writing":
      return { d: mdiPencil, label: "Writing...", color: INFO, pulse: true };
    case "calling_tool":
      return {
        d: mdiHammerScrewdriver,
        label: "Calling a tool...",
        color: INFO,
        pulse: true,
      };
    case "updating_state":
      return { d: mdiSync, label: "Updating...", color: INFO, pulse: true };
    default:
      return {
        d: mdiDotsHorizontalCircleOutline,
        label: "Working...",
        color: INFO,
        pulse: true,
      };
  }
};

const resolveView = (
  status: AgentRunStatus,
  activity: AgentActivity,
): StatusView | undefined => {
  switch (status) {
    case "running":
      return activityView(activity);
    case "awaiting_input":
      return {
        d: mdiAccountQuestionOutline,
        label: "Waiting for your input",
        color: INFO,
      };
    case "success":
      return { d: mdiCheckCircleOutline, label: "Done", color: SUCCESS };
    case "error":
      return {
        d: mdiAlertCircleOutline,
        label: "Something went wrong",
        color: ERROR,
      };
    case "aborted":
      return { d: mdiStopCircleOutline, label: "Stopped" };
    default:
      return undefined;
  }
};

export const ElmAgUiStatus = (props: ElmAgUiStatusProps) => {
  const [local, rest] = splitProps(props, [
    "class",
    "children",
    "status",
    "activity",
    "label",
  ]);
  const view = createMemo(() => {
    const resolved = resolveView(local.status, local.activity ?? "idle");
    return resolved
      ? { ...resolved, label: local.label ?? resolved.label }
      : undefined;
  });

  return (
    <Show when={view()} keyed>
      {(current) => (
        <div
          {...rest}
          class={clsx(styles["elm-ag-ui-status"], local.class)}
          role="status"
          aria-live="polite"
        >
          <div class={styles.reel}>
            <ElmMdiIcon
              d={current.d}
              size="1rem"
              color={current.color}
              class={current.pulse ? styles.pulse : undefined}
            />
            <ElmInlineText color={current.color}>{current.label}</ElmInlineText>
          </div>
        </div>
      )}
    </Show>
  );
};
