import type { Meta, StoryObj } from "storybook-framework-qwik";

import { ElmCodeBlock } from "./elm-code-block";
import { ElmInlineText } from "../typography/elm-inline-text";

import rustCode from "./seed/main.rs?raw";

const meta: Meta<typeof ElmCodeBlock> = {
  title: "Components/Code/elm-code-block",
  component: ElmCodeBlock,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { code: "const foo = 'bar'", language: "javascript" },
};

export const Rust: Story = {
  args: {
    code: rustCode,
    language: "rust",
    caption: "/workspaces/elmethis/packages/storybook",
  },
};

export const Caption: Story = {
  args: { code: rustCode, language: "rust", caption: "src/main.rs" },
};

export const CaptionSlot: Story = {
  args: { code: rustCode, language: "rust" },
  render() {
    return (
      <ElmCodeBlock {...this.args}>
        <ElmInlineText text="File:" />
        <ElmInlineText text="src/main.rs" code />
      </ElmCodeBlock>
    );
  },
};
