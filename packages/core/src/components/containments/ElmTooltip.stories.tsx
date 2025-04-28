import type { Meta, StoryObj } from "@storybook/vue3";
import ElmTooltip from "./ElmTooltip.vue";
import ElmInlineText from "../typography/ElmInlineText.vue";

const meta: Meta<typeof ElmTooltip> = {
  title: "Components/Containments/ElmTooltip",
  component: ElmTooltip,
  tags: ["autodocs"],
  args: {},
  render: (args) => ({
    components: { ElmTooltip, ElmInlineText },
    setup() {
      return { args };
    },
    template: `<ElmTooltip v-bind="args">
    <template #original><ElmInlineText text='HOVER ME' /></template>
    <template #tooltip><ElmInlineText text='TOOLTIP' /></template>
    </ElmTooltip >`,
  }),
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
