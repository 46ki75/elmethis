import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmCopyIcon, type ElmCopyIconProps } from "./elm-copy-icon";

const meta: Meta<ElmCopyIconProps> = {
  title: "Components/Icon/elm-copy-icon",
  component: ElmCopyIcon,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmCopyIconProps>;

export const Primary: Story = {
  args: {
    content: "Hello, World!",
  },
};
