import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmMarkdown } from "./ElmMarkdown";
import markdown from "./ElmMarkdown.md?raw";

const meta: Meta<typeof ElmMarkdown> = {
  title: "Components/Others/ElmMarkdown",
  component: ElmMarkdown,
  tags: ["autodocs"],
  args: {
    markdown,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
