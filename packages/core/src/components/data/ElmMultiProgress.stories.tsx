import type { Meta, StoryObj } from "@storybook/vue3";
import ElmMultiProgress from "./ElmMultiProgress.vue";

const meta: Meta<typeof ElmMultiProgress> = {
  title: "Components/Data/ElmMultiProgress",
  component: ElmMultiProgress,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    progress: [
      {
        value: 50,
        color: "#5879b0",
      },
      {
        value: 70,
        color: "#9771bd",
      },
      {
        value: 70,
        color: "#c9699e",
      },
    ],
  },
};
