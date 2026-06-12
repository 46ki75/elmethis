import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { mdiAccountOutline } from "@mdi/js";

import { ElmSelect, type ElmSelectOption } from "./elm-select";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

const MiniMax =
  "https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/minimax-color.svg";
const OpenAI =
  "https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/openai.svg";
const Claude =
  "https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/claude-color.svg";

const OPTIONS: ElmSelectOption[] = [
  {
    id: "minimax/minimax-m2.5",
    label: "MiniMax: MiniMax M2.5",
    icon: MiniMax,
  },
  {
    id: "minimax/minimax-m2.7",
    label: "MiniMax: MiniMax M2.7",
    icon: MiniMax,
  },
  {
    id: "openai/gpt-5.4-nano",
    label: "OpenAI: GPT-5.4 Nano",
    icon: OpenAI,
  },
  {
    id: "openai/gpt-5.4-mini",
    label: "OpenAI: GPT-5.4 Mini",
    icon: OpenAI,
  },
  {
    id: "anthropic/claude-sonnet-4.6",
    label: "Anthropic: Claude Sonnet 4.6",
    icon: Claude,
  },
  {
    id: "anthropic/claude-opus-4.7",
    label: "Anthropic: Claude Opus 4.7",
    icon: Claude,
  },
];

const meta = {
  title: "Components/Form/elm-select",
  component: ElmSelect,
  tags: ["autodocs"],
  args: {
    label: "Select",
    options: OPTIONS,
  },
} satisfies Meta<typeof ElmSelect>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const WithIcon: Story = {
  args: {
    label: "Select with icon",
    icon: <ElmMdiIcon d={mdiAccountOutline} />,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

const ControlledStory = (args: ComponentProps<typeof ElmSelect>) => {
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <ElmSelect
        {...args}
        label="Controlled select"
        selectedOptionId={selectedOptionId}
        onSelectedOptionIdChange={setSelectedOptionId}
      />
      <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
        <div>selected: {selectedOptionId ?? "none"}</div>
      </div>
      <button onClick={() => setSelectedOptionId(null)}>Clear selection</button>
    </div>
  );
};

export const Controlled: Story = {
  render: (args) => <ControlledStory {...args} />,
};
