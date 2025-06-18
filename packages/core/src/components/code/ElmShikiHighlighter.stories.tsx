import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmShikiHighlighter from "./ElmShikiHighlighter.vue";

import code from "./seed/main.rs?raw";

const meta: Meta<typeof ElmShikiHighlighter> = {
  title: "Components/Code/ElmShikiHighlighter",
  component: ElmShikiHighlighter,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    code: code,
    language: "rust",
  },
};
