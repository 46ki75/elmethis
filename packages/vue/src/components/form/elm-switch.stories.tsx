import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ref } from "vue";

import { ElmSwitch } from "./elm-switch";

const meta = {
  title: "Components/Form/elm-switch",
  component: ElmSwitch,
  tags: ["autodocs"],
  args: {
    checked: false,
    size: "18px",
    disabled: false,
  },
  argTypes: {
    color: { control: "color" },
  },
} satisfies Meta<typeof ElmSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

// The switch's checked state is owned by the story harness.
export const Primary: Story = {
  render: (args) => ({
    components: { ElmSwitch },
    setup() {
      const checked = ref(false);
      return { args, checked };
    },
    template: `<ElmSwitch v-bind="args" v-model:checked="checked" />`,
  }),
};
