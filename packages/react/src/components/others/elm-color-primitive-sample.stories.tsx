import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmColorPrimitiveSample } from "./elm-color-primitive-sample";

const meta = {
  title: "Components/Others/elm-color-primitive-sample",
  component: ElmColorPrimitiveSample,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmColorPrimitiveSample>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
