import type { Meta, StoryObj } from "@storybook/vue3";
import ElmCodeBlock from "./ElmCodeBlock.vue";

import rustCode from "./seed/main.rs?raw";
import ElmInlineText from "../typography/ElmInlineText.vue";

const meta: Meta<typeof ElmCodeBlock> = {
  title: "Components/Code/ElmCodeBlock",
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
  args: { code: rustCode, language: "rust" },
};

export const Cpation: Story = {
  args: { code: rustCode, language: "rust", caption: "src/main.rs" },
};

export const CpationSlot: Story = {
  args: { code: rustCode, language: "rust" },
  render: (args) => ({
    setup: () => ({ args }),
    components: { ElmCodeBlock, ElmInlineText },
    template: `
      <ElmCodeBlock v-bind="args">
        <ElmInlineText text="File:" />
        <ElmInlineText text="src/main.rs" code />
      </ElmCodeBlock>
      `,
  }),
};
