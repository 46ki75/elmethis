import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmCodeBlock } from "./elm-code-block";

const meta = {
  title: "Components/Code/elm-code-block",
  component: ElmCodeBlock,
  tags: ["autodocs"],
} satisfies Meta<typeof ElmCodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

const code = `import { createSignal } from "solid-js";

const [count, setCount] = createSignal(0);
setCount(count() + 1);`;

export const Primary: Story = {
  args: { code, language: "typescript" },
};

export const Caption: Story = {
  args: { code, language: "typescript", caption: "src/counter.ts" },
};

export const CaptionChildren: Story = {
  args: { code, language: "typescript" },
  render: (args) => (
    <ElmCodeBlock {...args} caption="Source: ">
      <ElmInlineText code>src/counter.ts</ElmInlineText>
    </ElmCodeBlock>
  ),
};
