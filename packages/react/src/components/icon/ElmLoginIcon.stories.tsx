import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmLoginIcon } from "./ElmLoginIcon";

const meta: Meta<typeof ElmLoginIcon> = {
  title: "Components/Icon/ElmLoginIcon",
  component: ElmLoginIcon,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
