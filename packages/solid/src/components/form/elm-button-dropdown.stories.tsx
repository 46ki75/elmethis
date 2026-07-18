import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import {
  ElmButtonDropdown,
  type ElmButtonDropdownItem,
  type ElmButtonDropdownProps,
} from "./elm-button-dropdown";

const MiniMax =
  "https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/minimax-color.svg";
const OpenAI =
  "https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/openai.svg";
const Claude =
  "https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/claude-color.svg";

const MODELS: ElmButtonDropdownItem[] = [
  { id: "claude", label: "Claude Opus 4.7", icon: Claude },
  { id: "gpt", label: "GPT-5.4 Mini", icon: OpenAI },
  { id: "minimax", label: "MiniMax M2.5", icon: MiniMax },
];

const meta = {
  title: "Components/Form/elm-button-dropdown",
  component: ElmButtonDropdown,
  tags: ["autodocs"],
  args: {
    label: "Select a model",
    items: MODELS,
  },
} satisfies Meta<typeof ElmButtonDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Preselected: Story = {
  args: { defaultSelectedOptionId: "claude" },
};

export const Block: Story = { args: { block: true } };

export const Disabled: Story = { args: { disabled: true } };

export const DisableMainButton: Story = {
  args: { disableMainButton: true },
};

export const DisableDropdown: Story = { args: { disableDropdown: true } };

export const Loading: Story = { args: { isLoading: true } };

const ControlledDropdown = (props: ElmButtonDropdownProps) => {
  const [selectedOptionId, setSelectedOptionId] = createSignal<string | null>(
    null,
  );
  const [log, setLog] = createSignal("none");

  return (
    <div style={{ display: "flex", "flex-direction": "column", gap: "1rem" }}>
      <ElmButtonDropdown
        {...props}
        selectedOptionId={selectedOptionId()}
        onSelectedOptionIdChange={setSelectedOptionId}
        onClick={(item) => setLog(`run: ${item?.id ?? "none"}`)}
      />
      <div style={{ "font-family": "monospace", "font-size": "0.85rem" }}>
        <div>selected: {selectedOptionId() ?? "none"}</div>
        <div>last run: {log()}</div>
      </div>
      <button onClick={() => setSelectedOptionId(null)}>Clear selection</button>
    </div>
  );
};

export const Controlled: Story = {
  render: (args) => <ControlledDropdown {...args} />,
};
