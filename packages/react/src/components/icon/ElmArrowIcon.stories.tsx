import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmArrowIcon } from "./ElmArrowIcon";

const meta: Meta<typeof ElmArrowIcon> = {
  title: "Components/Icon/ElmArrowIcon",
  component: ElmArrowIcon,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    direction: {
      options: ["up", "down", "left", "right"],
      control: { type: "radio" },
    },
    loading: {
      control: { type: "boolean" },
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
