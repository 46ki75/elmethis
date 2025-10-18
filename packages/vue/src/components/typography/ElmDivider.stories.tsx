import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmDivider from "./ElmDivider.vue";

const meta: Meta<typeof ElmDivider> = {
  title: "Components/Typography/ElmDivider",
  component: ElmDivider,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
