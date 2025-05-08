import type { Meta, StoryObj } from "@storybook/vue3";
import ElmSimpleTooltip from "./ElmSimpleTooltip.vue";
import ElmInlineText from "../typography/ElmInlineText.vue";

const meta: Meta<typeof ElmSimpleTooltip> = {
  title: "Components/containments/ElmSimpleTooltip",
  component: ElmSimpleTooltip,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    text: "Hello, tooltip!",
  },
  render: (args) => ({
    components: { ElmSimpleTooltip, ElmInlineText },
    setup() {
      return { args };
    },
    template: `<ElmSimpleTooltip v-bind="args">
      <ElmInlineText text='HOVER ME' />
    </ElmSimpleTooltip >`,
  }),
};
