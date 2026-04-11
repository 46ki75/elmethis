import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmInlineIcon } from "./ElmInlineIcon";

import viteIcon from "@assets/vite.svg?url";

const meta: Meta<typeof ElmInlineIcon> = {
  title: "Components/Icon/ElmInlineIcon",
  component: ElmInlineIcon,
  tags: ["autodocs"],
  args: {
    src: viteIcon,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
