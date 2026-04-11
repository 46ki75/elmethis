import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmInlineText } from "./ElmInlineText";

const meta: Meta<typeof ElmInlineText> = {
  title: "Components/Components/ElmInlineText",
  component: ElmInlineText,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    color: {
      control: "color",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
