import type { Meta, StoryObj } from "@storybook/react-vite";
import ElmParagraph from "./ElmParagraph";

const meta: Meta<typeof ElmParagraph> = {
  title: "Components/Typography/ElmParagraph",
  component: ElmParagraph,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { children: <span>Hello, world!</span> },
};
