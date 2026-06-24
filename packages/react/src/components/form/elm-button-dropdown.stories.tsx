import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { mdiContentSave } from "@mdi/js";

import {
  ElmButtonDropdown,
  type ElmButtonDropdownItem,
} from "./elm-button-dropdown";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

const Claude =
  "https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/claude-color.svg";
const OpenAI =
  "https://registry.npmmirror.com/@lobehub/icons-static-svg/latest/files/icons/openai.svg";

const ITEMS: ElmButtonDropdownItem[] = [
  { id: "save", label: "Save" },
  { id: "save-as", label: "Save as…" },
  { id: "duplicate", label: "Duplicate" },
  { id: "delete", label: "Delete", disabled: true },
];

const MODELS: ElmButtonDropdownItem[] = [
  { id: "claude", label: "Claude Opus 4.7", icon: Claude },
  { id: "gpt", label: "GPT-5.4 Mini", icon: OpenAI },
];

const meta = {
  title: "Components/Form/elm-button-dropdown",
  component: ElmButtonDropdown,
  tags: ["autodocs"],
  args: {
    label: "Save",
    icon: <ElmMdiIcon d={mdiContentSave} />,
    items: ITEMS,
  },
} satisfies Meta<typeof ElmButtonDropdown>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const WithItemIcons: Story = {
  args: {
    label: "Model",
    icon: undefined,
    items: MODELS,
  },
};

export const Block: Story = {
  args: {
    block: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const DisableMainButton: Story = {
  args: {
    disableMainButton: true,
  },
};

export const DisableDropdown: Story = {
  args: {
    disableDropdown: true,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

const InteractiveStory = (args: ComponentProps<typeof ElmButtonDropdown>) => {
  const [log, setLog] = useState<string>("none");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <ElmButtonDropdown
        {...args}
        onClick={() => setLog("main button clicked")}
        onItemClick={(item) => setLog(`item clicked: ${item.id}`)}
      />
      <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
        last action: {log}
      </div>
    </div>
  );
};

export const Interactive: Story = {
  render: (args) => <InteractiveStory {...args} />,
};
