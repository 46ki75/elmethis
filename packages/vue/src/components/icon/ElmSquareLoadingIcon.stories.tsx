import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmSquareLoadingIcon from "./ElmSquareLoadingIcon.vue";

const meta: Meta<typeof ElmSquareLoadingIcon> = {
  title: "Components/Icon/ElmSquareLoadingIcon",
  component: ElmSquareLoadingIcon,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    size: "3rem",
    dimensions: 4,
  },
};
