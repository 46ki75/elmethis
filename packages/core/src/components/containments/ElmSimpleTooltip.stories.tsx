import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmSimpleTooltip from "./ElmSimpleTooltip.vue";
import ElmInlineText from "../typography/ElmInlineText.vue";

const meta: Meta<typeof ElmSimpleTooltip> = {
  title: "Components/containments/ElmSimpleTooltip",
  component: ElmSimpleTooltip,
  tags: ["autodocs"],
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

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Title: Story = {
  args: {
    title: "Toltip Title",
    text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse eu auctor eros. In sit amet suscipit odio. Vivamus mattis eleifend porta. Vivamus accumsan ante ut eleifend lobortis. Aliquam maximus purus a convallis posuere. Proin faucibus odio orci, sollicitudin auctor nibh accumsan nec. Fusce a urna at augue luctus malesuada ut non tortor. Mauris facilisis pulvinar blandit.",
  },
};
