import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmTyping from "./ElmTyping.vue";

const meta: Meta<typeof ElmTyping> = {
  title: "Components/Others/ElmTyping",
  component: ElmTyping,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
