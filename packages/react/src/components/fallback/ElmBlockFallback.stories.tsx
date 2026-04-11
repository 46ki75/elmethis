import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmBlockFallback } from "./ElmBlockFallback";

const meta: Meta<typeof ElmBlockFallback> = {
  title: "Components/Fallback/ElmBlockFallback",
  component: ElmBlockFallback,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
