import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmParagraph } from "./ElmParagraph";
import { ElmInlineText } from "./ElmInlineText";

const meta: Meta<typeof ElmParagraph> = {
  title: "Components/Typography/ElmParagraph",
  component: ElmParagraph,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    color: { control: "color" },
    backgroundColor: { control: "color" },
  },
  render(args) {
    return (
      <ElmParagraph {...args}>
        <ElmInlineText>
          This is a paragraph with an inline text component
        </ElmInlineText>
      </ElmParagraph>
    );
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Color: Story = {
  args: {
    color: "#4b9ba9",
  },
};

export const BackgroundColor: Story = {
  args: {
    backgroundColor: "#b1d6dc",
  },
};
