import type { Meta, StoryObj } from "@storybook/vue3";
import ElmRectangleWave from "./ElmRectangleWave.vue";

const meta: Meta<typeof ElmRectangleWave> = {
  title: "Components/Fallback/ElmRectangleWave",
  component: ElmRectangleWave,
  tags: ["autodocs"],
  args: {},
  render: () => {
    return {
      components: { ElmRectangleWave },
      template: `<div style="height: 400px;"><ElmRectangleWave /></div>`,
    };
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
