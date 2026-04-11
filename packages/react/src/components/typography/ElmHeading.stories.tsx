import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmHeading } from "./ElmHeading";
import { ElmInlineText } from "./ElmInlineText";

const meta: Meta<typeof ElmHeading> = {
  title: "Components/Typography/ElmHeading",
  component: ElmHeading,
  tags: ["autodocs"],
  argTypes: {
    level: {
      options: [1, 2, 3, 4, 5, 6],
      control: "radio",
    },
  },
  args: {
    text: "Heading",
    level: 1,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Slot: Story = {
  render: (args) => (
    <ElmHeading {...args}>
      <ElmInlineText color="crimson">This</ElmInlineText> is{" "}
      <ElmInlineText code>code</ElmInlineText> !
    </ElmHeading>
  ),
};
