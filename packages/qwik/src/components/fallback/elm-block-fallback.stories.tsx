import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmBlockFallback } from "./elm-block-fallback";

const meta: Meta<typeof ElmBlockFallback> = {
  title: "Components/Fallback/elm-block-fallback",
  component: ElmBlockFallback,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
