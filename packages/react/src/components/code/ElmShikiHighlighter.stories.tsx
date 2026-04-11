import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmShikiHighlighter } from "./ElmShikiHighlighter";

const rustCode = `fn main() {
    println!("Hello, world!");
}`;

const meta: Meta<typeof ElmShikiHighlighter> = {
  title: "Components/Code/ElmShikiHighlighter",
  component: ElmShikiHighlighter,
  tags: ["autodocs"],
  args: {
    code: rustCode,
    language: "rust",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
