import type { Meta, StoryObj } from "storybook-framework-qwik";
import { component$, useStore, useVisibleTask$ } from "@qwik.dev/core";

import { ElmAgUiStatus, type ElmAgUiStatusProps } from "./elm-ag-ui-status";
import type {
  AgentActivity,
  AgentRunStatus,
} from "../internal/create-agent-subscriber";
import { ElmInlineText } from "../../typography/elm-inline-text";

const meta: Meta<ElmAgUiStatusProps> = {
  title: "Components/AG-UI/elm-ag-ui-status",
  component: ElmAgUiStatus,
  tags: ["autodocs"],
  args: {
    status: "running",
    activity: "thinking",
  },
};

export default meta;
type Story = StoryObj<ElmAgUiStatusProps>;

export const Primary: Story = {};

const runStatuses: AgentRunStatus[] = [
  "idle",
  "running",
  "success",
  "awaiting_input",
  "error",
  "aborted",
];

export const AllStates: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {runStatuses.map((status) => (
        <div
          key={status}
          style={{ display: "flex", gap: "1rem", alignItems: "center" }}
        >
          <ElmInlineText code>{status}</ElmInlineText>
          <ElmAgUiStatus status={status} activity="thinking" />
        </div>
      ))}
    </div>
  ),
};

const activities: AgentActivity[] = [
  "thinking",
  "writing",
  "calling_tool",
  "updating_state",
];

export const Activities: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {activities.map((activity) => (
        <ElmAgUiStatus key={activity} status="running" activity={activity} />
      ))}
    </div>
  ),
};

// A representative run: think → write → call a tool → write → done → rest.
const frames: ElmAgUiStatusProps[] = [
  { status: "running", activity: "thinking" },
  { status: "running", activity: "writing" },
  { status: "running", activity: "calling_tool" },
  { status: "running", activity: "writing" },
  { status: "success" },
  { status: "idle" },
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function* cycle() {
  while (true) {
    for (const frame of frames) {
      await sleep(900);
      yield frame;
    }
  }
}

const RenderTransition = component$(() => {
  const state = useStore<{ frame: ElmAgUiStatusProps }>({ frame: frames[0] });

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(async () => {
    for await (const frame of cycle()) {
      state.frame = frame;
    }
  });

  return (
    <ElmAgUiStatus
      status={state.frame.status}
      activity={state.frame.activity}
    />
  );
});

export const Transition: Story = {
  render: () => <RenderTransition />,
};
