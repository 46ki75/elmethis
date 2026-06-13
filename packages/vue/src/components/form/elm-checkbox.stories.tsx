import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";

import { ElmCheckbox } from "./elm-checkbox";

const meta = {
  title: "Components/Form/elm-checkbox",
  component: ElmCheckbox,
  tags: ["autodocs"],
  args: {
    label: "Checkbox Label",
    isLoading: false,
    disabled: false,
  },
} satisfies Meta<typeof ElmCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

// Uncontrolled: the checkbox manages its own checked state.
export const Primary: Story = {};

export const DefaultChecked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

// Controlled: parent owns the checked state via `v-model:checked`.
export const Controlled: Story = {
  render: (args) => ({
    components: { ElmCheckbox },
    setup() {
      const checked = ref(false);
      return { args, checked };
    },
    template: `
      <div style="display: flex; align-items: center; gap: 1rem;">
        <ElmCheckbox
          v-bind="args"
          label="Controlled checkbox"
          v-model:checked="checked"
        />
        <span style="font-family: monospace;">checked: {{ checked }}</span>
        <button @click="checked = false">Reset</button>
      </div>
    `,
  }),
};
