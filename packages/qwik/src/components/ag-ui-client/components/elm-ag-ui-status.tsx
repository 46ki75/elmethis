import { component$, type ClassList, type CSSProperties } from "@qwik.dev/core";
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

import styles from "./elm-ag-ui-status.module.css";
import { ElmMdiIcon } from "../../icon/elm-mdi-icon";
import { ElmInlineText } from "../../typography/elm-inline-text";
import type {
  AgentActivity,
  AgentRunStatus,
} from "../internal/create-agent-subscriber";

export interface ElmAgUiStatusProps {
  /** Coarse run lifecycle from `useAgent`'s `state.status`. */
  status: AgentRunStatus;
  /** Live in-run activity from `state.activity`; only read while running. */
  activity?: AgentActivity;
  /** Override the default English label (e.g. for localization). */
  label?: string;
  class?: ClassList;
  style?: CSSProperties;
}

const INFO = "var(--elmethis-color-accent-info)";
const SUCCESS = "var(--elmethis-color-accent-success)";
const ERROR = "var(--elmethis-color-accent-error)";

interface StatusView {
  d: string;
  label: string;
  /** Token color for the icon + text; omitted falls back to neutral. */
  color?: string;
  /** Animate the icon to signal work in progress. */
  pulse?: boolean;
}

const activityView = (activity: AgentActivity): StatusView => {
  switch (activity) {
    case "thinking":
      return { d: mdiBrain, label: "Thinking…", color: INFO, pulse: true };
    case "writing":
      return { d: mdiPencil, label: "Writing…", color: INFO, pulse: true };
    case "calling_tool":
      return {
        d: mdiHammerScrewdriver,
        label: "Calling a tool…",
        color: INFO,
        pulse: true,
      };
    case "updating_state":
      return { d: mdiSync, label: "Updating…", color: INFO, pulse: true };
    case "idle":
    default:
      return {
        d: mdiDotsHorizontalCircleOutline,
        label: "Working…",
        color: INFO,
        pulse: true,
      };
  }
};

/** Map (status, activity) to the rendered view, or `null` when there is
 *  nothing to show (the idle resting state). */
const resolveView = (
  status: AgentRunStatus,
  activity: AgentActivity,
): StatusView | null => {
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
    case "idle":
    default:
      return null;
  }
};

/**
 * Compact status indicator for an AG-UI agent. Reads `state.status` (coarse run
 * lifecycle) and `state.activity` (what the agent is doing right now) and shows
 * an icon + label, animating while a run is in flight. Renders nothing when the
 * agent is idle. The labels are plain English; pass `label` to override.
 */
export const ElmAgUiStatus = component$<ElmAgUiStatusProps>(
  ({ status, activity = "idle", label, class: className, style }) => {
    const view = resolveView(status, activity);
    if (!view) return null;

    const displayLabel = label ?? view.label;

    return (
      <div
        class={[styles["elm-ag-ui-status"], className]}
        style={style}
        role="status"
        aria-live="polite"
      >
        {/*
          Reel: the `key` changes whenever the rendered (status, activity,
          label) tuple does, so Qwik swaps in a fresh node and the CSS
          roll-in animation replays. The host clips overflow, so the new
          cell appears to roll up into place — like a slot/odometer.
        */}
        <div
          key={`${status}:${activity}:${displayLabel}`}
          class={styles["reel"]}
        >
          <ElmMdiIcon
            d={view.d}
            size="1rem"
            color={view.color}
            class={view.pulse ? styles.pulse : undefined}
          />
          <ElmInlineText color={view.color}>{displayLabel}</ElmInlineText>
        </div>
      </div>
    );
  },
);
