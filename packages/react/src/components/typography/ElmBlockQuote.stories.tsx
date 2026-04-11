import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmBlockQuote } from "./ElmBlockQuote";
import { ElmInlineText } from "./ElmInlineText";

const meta: Meta<typeof ElmBlockQuote> = {
  title: "Components/Typography/ElmBlockQuote",
  component: ElmBlockQuote,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.";

export const Primary: Story = {
  args: { cite: "https://www.lipsum.com/" },
  render: (args) => (
    <ElmBlockQuote {...args}>
      <p>
        <ElmInlineText>{lorem}</ElmInlineText>
      </p>
    </ElmBlockQuote>
  ),
};
