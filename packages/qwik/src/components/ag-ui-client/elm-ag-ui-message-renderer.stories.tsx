import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmAgUiMessageRenderer,
  type ElmAgUiMessageRendererProps,
} from "./elm-ag-ui-message-renderer";

const meta: Meta<ElmAgUiMessageRendererProps> = {
  title: "Components/AG-UI/elm-ag-ui-message-renderer",
  component: ElmAgUiMessageRenderer,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmAgUiMessageRendererProps>;

export const UserTextMessage: Story = {
  args: {
    messages: [
      {
        id: "msg-001",
        role: "user",
        content: "Hello! Can you help me understand how AG-UI works?",
      },
    ],
  },
};

export const AssistantMarkdownMessage: Story = {
  args: {
    messages: [
      {
        id: "msg-002",
        role: "assistant",
        content: `## AG-UI Overview

AG-UI is a protocol that standardizes communication between AI agents and frontend applications.

Key features:
- **Vendor-neutral**: Works with any LLM provider
- **Streaming support**: Real-time text and tool call updates
- **Multimodal**: Supports text, images, audio, and documents

\`\`\`typescript
const client = new AgUiClient({ endpoint: "/api/agent" });
\`\`\`
`,
      },
    ],
  },
};

export const Conversation: Story = {
  args: {
    messages: [
      {
        id: "msg-102",
        role: "user",
        content: "What is the capital of France?",
      },
      {
        id: "msg-103",
        role: "assistant",
        content: "The capital of France is **Paris**.",
      },
      {
        id: "msg-104",
        role: "user",
        content: "What about Germany?",
      },
      {
        id: "msg-105",
        role: "assistant",
        content: "The capital of Germany is **Berlin**.",
      },
    ],
  },
};

export const UserImageMessage: Story = {
  args: {
    messages: [
      {
        id: "msg-201",
        role: "user",
        content: [
          {
            type: "text",
            text: "What do you see in this image?",
          },
          {
            type: "image",
            source: {
              type: "url",
              value: "https://placehold.co/400x300?text=Sample+Image",
            },
          },
        ],
      },
    ],
  },
};

export const AssistantWithToolCall: Story = {
  args: {
    messages: [
      {
        id: "msg-301",
        role: "user",
        content: "What is the weather in Tokyo?",
      },
      {
        id: "msg-302",
        role: "assistant",
        toolCalls: [
          {
            id: "call-001",
            type: "function",
            function: {
              name: "get_weather",
              arguments: JSON.stringify({ location: "Tokyo", unit: "celsius" }),
            },
          },
        ],
      },
      {
        id: "msg-304",
        role: "assistant",
        content: "The current weather in Tokyo is **22°C** and sunny with 60% humidity.",
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    messages: [],
  },
};
