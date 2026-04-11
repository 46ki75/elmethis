import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmTyping } from "./ElmTyping";

const meta: Meta<typeof ElmTyping> = {
  title: "Components/Others/ElmTyping",
  component: ElmTyping,
  tags: ["autodocs"],
  args: {
    target: "The quick brown fox jumps over the lazy dog",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Short: Story = {
  args: {
    target: "Hello world",
  },
};
