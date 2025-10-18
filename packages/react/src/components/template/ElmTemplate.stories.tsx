import type { Meta, StoryObj } from "@storybook/react-vite";
import ElmTemplate from "./ElmTemplate";

const meta: Meta<typeof ElmTemplate> = {
  title: "Template/Template/ElmTemplate",
  component: ElmTemplate,
  tags: ["autodocs"],
  args: {
    message: "Hello, world!",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
