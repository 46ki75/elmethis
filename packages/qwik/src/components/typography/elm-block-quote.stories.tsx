import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmBlockQuote, type ElmBlockQuoteProps } from "./elm-block-quote";

const meta: Meta<ElmBlockQuoteProps> = {
  title: "Components/Typography/elm-block-quote",
  component: ElmBlockQuote,
  tags: ["autodocs"],
  args: {},
  render() {
    return (
      <ElmBlockQuote>
        Only a fool learns from his own mistakes. The wise man learns from the
        mistakes of others.
      </ElmBlockQuote>
    );
  },
};

export default meta;
type Story = StoryObj<ElmBlockQuoteProps>;

export const Primary: Story = {};
