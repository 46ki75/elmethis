import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmHeading } from "./elm-heading";

const meta = {
  title: "Components/Typography/elm-heading",
  component: ElmHeading,
  tags: ["autodocs"],
  args: { level: 1 },
  argTypes: {
    level: {
      options: [1, 2, 3, 4, 5, 6],
      control: "radio",
    },
  },
} satisfies Meta<typeof ElmHeading>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { level: 1, text: "Heading", id: "heading-id" },
};

export const Children: Story = {
  args: { level: 1, id: "heading-children" },
  render: (args) => <ElmHeading {...args}>This is content!</ElmHeading>,
};
