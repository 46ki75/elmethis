import type { Meta, StoryObj } from "@storybook/vue3-vite";
import { ElmDivider } from "./elm-divider";

const meta = {
  title: "Components/Typography/elm-divider",
  component: ElmDivider,
  tags: ["autodocs"],
  args: {},
  render: (args) => ({
    components: { ElmDivider },
    setup() {
      return { args };
    },
    template: `<ElmDivider v-bind="args" />`,
  }),
} satisfies Meta<typeof ElmDivider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
