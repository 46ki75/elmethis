import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmCallout } from "./elm-callout";
import { ElmParagraph } from "./elm-paragraph";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc tincidunt aliquam. Nullam nec purus nec nunc tincidunt aliquam.";

const meta = {
  title: "Components/Typography/elm-callout",
  component: ElmCallout,
  tags: ["autodocs"],
  args: {},
  argTypes: {
    type: {
      control: "radio",
      options: ["note", "tip", "important", "warning", "caution"],
    },
  },
  render: (args) => (
    <ElmCallout {...args}>
      <ElmParagraph>{lorem}</ElmParagraph>
    </ElmCallout>
  ),
} satisfies Meta<typeof ElmCallout>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Tip: Story = {
  args: { type: "tip" },
};

export const Important: Story = {
  args: { type: "important" },
};

export const Warning: Story = {
  args: { type: "warning" },
};

export const Caution: Story = {
  args: { type: "caution" },
};
