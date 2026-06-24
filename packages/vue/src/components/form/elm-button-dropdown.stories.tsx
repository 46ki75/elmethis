import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";

import {
  ElmButtonDropdown,
  type ElmButtonDropdownItem,
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
  args: {
    defaultSelectedOptionId: "claude",
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

export const Controlled: Story = {
  render: (args) => ({
    components: { ElmButtonDropdown },
    setup() {
      const selectedOptionId = ref<string | null>(null);
      const log = ref<string>("none");
      const onClick = (item: ElmButtonDropdownItem | null) => {
        log.value = `run: ${item?.id ?? "none"}`;
      };
      return { args, selectedOptionId, log, onClick };
    },
    template: `
      <div style="display: flex; flex-direction: column; gap: 1rem">
        <ElmButtonDropdown v-bind="args" v-model:selected-option-id="selectedOptionId" @click="onClick" />
        <div style="font-family: monospace; font-size: 0.85rem">
          <div>selected: {{ selectedOptionId ?? "none" }}</div>
          <div>last run: {{ log }}</div>
        </div>
        <button @click="selectedOptionId = null">Clear selection</button>
      </div>
    `,
  }),
};
