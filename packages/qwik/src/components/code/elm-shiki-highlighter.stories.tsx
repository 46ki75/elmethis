import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmShikiHighlighter,
  type ElmShikiHighlighterProps,
} from "./elm-shiki-highlighter";

import code from "./seed/main.rs?raw";

const meta: Meta<ElmShikiHighlighterProps> = {
  title: "Components/Code/elm-shiki-highlighter",
  component: ElmShikiHighlighter,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmShikiHighlighterProps>;

export const Primary: Story = {
  args: {
    code: code,
    language: "rust",
  },
};
