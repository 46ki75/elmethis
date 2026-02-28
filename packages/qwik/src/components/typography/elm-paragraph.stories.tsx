import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmParagraph } from "./elm-paragraph";

const meta: Meta<typeof ElmParagraph> = {
  title: "Components/Typography/elm-paragraph",
  component: ElmParagraph,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    color: { control: "color" },
    backgroundColor: { control: "color" },
  },
  render() {
    return (
      <ElmParagraph {...this.args}>
        This is a paragraph with an inline text component.
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

export const Many: Story = {
  render() {
    return Array.from({ length: 50 }, (_, i) => (
      <ElmParagraph key={i} {...this.args}>
        This is a paragraph with an inline text component.
      </ElmParagraph>
    ));
  },
};
