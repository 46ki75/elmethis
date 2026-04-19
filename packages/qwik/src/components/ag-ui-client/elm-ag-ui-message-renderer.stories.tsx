import { component$, useSignal, useVisibleTask$ } from "@builder.io/qwik";
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

const md = `# AG-UI Protocol

AG-UI is a standardized protocol for communication between AI agents and frontend applications. It enables seamless integration of AI capabilities into user interfaces, supporting features like:

- **Vendor-neutral**: Works with any LLM provider
- **Streaming support**: Real-time text and tool call updates
- **Multimodal**: Supports text, images, audio, and documents

\`\`\`typescript
const client = new AgUiClient({ endpoint: "/api/agent" });
\`\`\`
`;

export const AssistantMarkdownMessage: Story = {
  args: {
    messages: [
      {
        id: "msg-002",
        role: "assistant",
        content: md,
      },
    ],
  },
};

async function* tokenStream(tokens: string[], delayMs: number) {
  for (const token of tokens) {
    await new Promise((resolve) => setTimeout(resolve, delayMs));
    yield token;
  }
}

const StreamingWrapper = component$(() => {
  const content = useSignal("");

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ cleanup }) => {
    const aborted = { value: false };
    cleanup(() => { aborted.value = true; });

    (async () => {
      for await (const token of tokenStream(md.split(/(?<=\s)|(?=\s)/), 80)) {
        if (aborted.value) break;
        content.value += token;
      }
    })();
  });

  return (
    <ElmAgUiMessageRenderer
      messages={[{ id: "msg-stream-001", role: "assistant", content: content.value }]}
    />
  );
});

export const AssistantMarkdownMessageStreaming: Story = {
  render: () => <StreamingWrapper />,
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
        content:
          "The current weather in Tokyo is **22°C** and sunny with 60% humidity.",
      },
    ],
  },
};

export const Empty: Story = {
  args: {
    messages: [],
  },
};
