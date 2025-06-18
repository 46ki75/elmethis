import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmCubeIcon from "./ElmCubeIcon.vue";

const meta: Meta<typeof ElmCubeIcon> = {
  title: "Components/Icon/ElmCubeIcon",
  component: ElmCubeIcon,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
