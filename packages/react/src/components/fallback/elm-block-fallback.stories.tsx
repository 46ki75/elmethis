import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmBlockFallback } from "./elm-block-fallback";

const meta = {
  title: "Components/Fallback/elm-block-fallback",
  component: ElmBlockFallback,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmBlockFallback>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
