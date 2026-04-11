import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmDivider } from "./ElmDivider";

const meta: Meta<typeof ElmDivider> = {
  title: "Components/Typography/ElmDivider",
  component: ElmDivider,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
