import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmShikiHighlighter } from "./elm-shiki-highlighter";

import code from "./seed/main.rs?raw";

const meta: Meta<typeof ElmShikiHighlighter> = {
  title: "Components/Code/elm-shiki-highlighter",
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
