import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmLanguageIcon } from "./ElmLanguageIcon";

const meta: Meta<typeof ElmLanguageIcon> = {
  title: "Components/Icon/ElmLanguageIcon",
  component: ElmLanguageIcon,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
