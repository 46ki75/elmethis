import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { mdiAccountOutline } from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import {
  ElmSelect,
  type ElmSelectOption,
  type ElmSelectProps,
} from "./elm-select";

const MiniMax =
  "https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/minimax-color.svg";
const OpenAI =
  "https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/openai.svg";
const Claude =
  "https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/claude-color.svg";

const OPTIONS: ElmSelectOption[] = [
  { id: "minimax", label: "MiniMax M2.5", icon: MiniMax },
  { id: "gpt", label: "GPT-5.4 Mini", icon: OpenAI },
  { id: "claude", label: "Claude Opus 4.7", icon: Claude },
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

export const Disabled: Story = { args: { disabled: true } };

export const Loading: Story = { args: { isLoading: true } };

const ControlledSelect = (props: ElmSelectProps) => {
  const [selectedOptionId, setSelectedOptionId] = createSignal<string | null>(
    null,
  );

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
      <ElmSelect
        {...props}
        label="Controlled select"
        selectedOptionId={selectedOptionId()}
        onSelectedOptionIdChange={setSelectedOptionId}
      />
      <div style={{ "font-family": "monospace", "font-size": "0.85rem" }}>
        selected: {selectedOptionId() ?? "none"}
      </div>
      <button onClick={() => setSelectedOptionId(null)}>Clear selection</button>
    </div>
  );
};

export const Controlled: Story = {
  render: (args) => <ControlledSelect {...args} />,
};
