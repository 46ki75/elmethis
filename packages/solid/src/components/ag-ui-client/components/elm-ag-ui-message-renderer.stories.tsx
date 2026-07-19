import type { Message } from "@ag-ui/core";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmAgUiMessageRenderer } from "./elm-ag-ui-message-renderer";

const meta = {
  title: "Components/AG-UI/Message Renderer",
  component: ElmAgUiMessageRenderer,
  tags: ["autodocs"],
  args: {
    handleRetry: () => undefined,
    isRunning: false,
    messages: [],
  },
} satisfies Meta<typeof ElmAgUiMessageRenderer>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Conversation: Story = {
  args: {
    messages: [
      {
        id: "user-1",
        role: "user",
        content: "Explain fine-grained reactivity.",
      },
      {
        id: "assistant-1",
        role: "assistant",
        content:
          "## Fine-grained reactivity\n\nOnly computations that read a changed signal update.",
      },
    ] as Message[],
  },
};

export const ToolCall: Story = {
  args: {
    messages: [
      {
        id: "assistant-tool",
        role: "assistant",
        content: null,
        toolCalls: [
          {
            id: "tool-1",
            type: "function",
            function: { name: "get_weather", arguments: '{"city":"Tokyo"}' },
          },
        ],
      },
      {
        id: "tool-result",
        role: "tool",
        toolCallId: "tool-1",
        content: '{"temperature":28,"condition":"clear"}',
      },
    ] as Message[],
  },
};

export const Reasoning: Story = {
  args: {
    isRunning: true,
    messages: [
      {
        id: "reasoning-1",
        role: "reasoning",
        content: "Checking the request and selecting the relevant context...",
      },
    ] as Message[],
  },
};
