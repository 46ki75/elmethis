import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmCubeIcon } from "./ElmCubeIcon";

const meta: Meta<typeof ElmCubeIcon> = {
  title: "Components/Icon/ElmCubeIcon",
  component: ElmCubeIcon,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
