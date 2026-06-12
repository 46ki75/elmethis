import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmBlockQuote } from "./elm-block-quote";

const meta = {
  title: "Components/Typography/elm-block-quote",
  component: ElmBlockQuote,
  tags: ["autodocs"],
  args: {},
  render: (args) => (
    <ElmBlockQuote {...args}>
      Only a fool learns from his own mistakes. The wise man learns from the
      mistakes of others.
    </ElmBlockQuote>
  ),
} satisfies Meta<typeof ElmBlockQuote>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
