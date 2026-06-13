import type { Meta, StoryObj } from "@storybook/vue3-vite";

import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

import code from "./seed/main.rs?raw";

const meta = {
  title: "Components/Code/elm-shiki-highlighter",
  component: ElmShikiHighlighter,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmShikiHighlighter>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    code,
    language: "rust",
  },
};
