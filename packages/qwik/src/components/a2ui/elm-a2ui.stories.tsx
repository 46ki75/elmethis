import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmA2ui, type ElmA2uiProps } from "./elm-a2ui";

const meta: Meta<ElmA2uiProps> = {
  title: "Components/A2UI/elm-a2ui",
  component: ElmA2ui,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Streaming A2UI renderer. Fetches a JSONL endpoint, drives a " +
          "`MessageProcessor`, and delegates rendering to `ElmA2uiRenderer`. " +
          "For pure rendering without HTTP logic, use `ElmA2uiRenderer` directly. " +
          "For streaming message pattern stories, see the `elm-a2ui-renderer` stories.",
      },
    },
  },
  argTypes: {
    url: {
      description: "JSONL stream endpoint URL.",
      control: "text",
    },
    headers: {
      description: "Optional HTTP headers forwarded to the stream request.",
      control: "object",
    },
    catalogId: {
      description:
        "A2UI catalog ID. Defaults to the v0.9 standard catalog URI.",
      control: "text",
    },
  },
};

export default meta;
type Story = StoryObj<ElmA2uiProps>;

export const ApiReference: Story = {
  args: {
    url: "https://your-server/api/a2ui/stream",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Shows the available props. The component will not render until a " +
          "valid JSONL stream URL is provided.",
      },
    },
  },
};
