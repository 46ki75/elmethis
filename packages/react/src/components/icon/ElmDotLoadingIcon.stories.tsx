import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmDotLoadingIcon } from "./ElmDotLoadingIcon";

const meta: Meta<typeof ElmDotLoadingIcon> = {
  title: "Components/Icon/ElmDotLoadingIcon",
  component: ElmDotLoadingIcon,
  tags: ["autodocs"],
  argTypes: { color: { control: "color" } },
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
