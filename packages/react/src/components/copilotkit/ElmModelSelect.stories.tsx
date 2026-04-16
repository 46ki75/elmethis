import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmModelSelect, type ElmModelSelectProps } from "./ElmModelSelect";

import ClaudeIcon from "@assets/claude.svg?url";
import GoogleGeminiIcon from "@assets/google-gemini.svg?url";
import OpenAIIcon from "@assets/openai.svg?url";
import { useState } from "react";

const meta: Meta<typeof ElmModelSelect> = {
  title: "Components/CopilotKit/ElmModelSelect",
  component: ElmModelSelect,
  tags: ["autodocs"],
  args: {},
};

export default meta;

const MODELS = [
  {
    modelId: "anthropic/claude-opus-4.6" as const,
    label: "Anthropic: Claude Opus 4.6",
    icon: ClaudeIcon,
  },
  {
    modelId: "anthropic/claude-sonnet-4.6" as const,
    label: "Anthropic: Claude Sonnet 4.6",
    icon: ClaudeIcon,
  },
  {
    modelId: "google/gemini-3.1-pro-preview" as const,
    label: "Google: Gemini 3.1 Pro Preview",
    icon: GoogleGeminiIcon,
  },
  {
    modelId: "google/gemini-3.1-flash-lite-preview" as const,
    label: "Google: Gemini 3.1 Flash Lite Preview",
    icon: GoogleGeminiIcon,
  },
  {
    modelId: "openai/gpt-5.4-nano" as const,
    label: "OpenAI: GPT-5.4 Nano",
    icon: OpenAIIcon,
  },
];

type Story = StoryObj<ElmModelSelectProps<(typeof MODELS)[number]["modelId"]>>;

const Render = (
  props: ElmModelSelectProps<(typeof MODELS)[number]["modelId"]>,
) => {
  const [selectedModelId, setSelectedModelId] = useState<
    (typeof MODELS)[number]["modelId"] | null
  >(null);

  return (
    <ElmModelSelect
      {...props}
      selectedModelId={selectedModelId}
      setSelectedModelId={setSelectedModelId}
    />
  );
};

export const Primary: Story = {
  render: (props) => <Render {...props} />,
  args: {
    models: MODELS,
  },
};
