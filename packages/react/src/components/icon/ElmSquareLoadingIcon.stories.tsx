import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmSquareLoadingIcon } from "./ElmSquareLoadingIcon";

const meta: Meta<typeof ElmSquareLoadingIcon> = {
  title: "Components/Icon/ElmSquareLoadingIcon",
  component: ElmSquareLoadingIcon,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    size: "3rem",
    dimensions: 4,
  },
};
