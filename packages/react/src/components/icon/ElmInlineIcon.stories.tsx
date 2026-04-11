import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmInlineIcon } from "./ElmInlineIcon";

const meta: Meta<typeof ElmInlineIcon> = {
  title: "Components/Icon/ElmInlineIcon",
  component: ElmInlineIcon,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
