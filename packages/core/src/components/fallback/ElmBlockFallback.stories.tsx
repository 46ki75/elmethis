import type { Meta, StoryObj } from "@storybook/vue3";
import ElmBlockFallback from "./ElmBlockFallback.vue";

const meta: Meta<typeof ElmBlockFallback> = {
  title: "Components/Fallback/ElmBlockFallback",
  component: ElmBlockFallback,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
