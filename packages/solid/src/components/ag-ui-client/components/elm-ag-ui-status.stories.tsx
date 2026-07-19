import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmAgUiStatus } from "./elm-ag-ui-status";

const meta = {
  title: "Components/AG-UI/Status",
  component: ElmAgUiStatus,
  tags: ["autodocs"],
  args: { status: "running", activity: "thinking" },
} satisfies Meta<typeof ElmAgUiStatus>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Thinking: Story = {};
export const CallingTool: Story = { args: { activity: "calling_tool" } };
export const AwaitingInput: Story = { args: { status: "awaiting_input" } };
export const Success: Story = { args: { status: "success" } };
export const Error: Story = { args: { status: "error" } };
