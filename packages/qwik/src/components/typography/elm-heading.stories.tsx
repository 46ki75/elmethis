import type { Meta, StoryObj } from "storybook-framework-qwik";

import { ElmHeading } from "./elm-heading";
import { ElmInlineText } from "./elm-inline-text";

const meta: Meta<typeof ElmHeading> = {
  title: "Components/Typography/elm-heading",
  component: ElmHeading,
  tags: ["autodocs"],
  argTypes: {
    level: {
      options: [1, 2, 3, 4, 5, 6],
      control: "radio",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    level: 1,
    text: "Heading",
    id: "heading-id",
  },
};

export const Slot: Story = {
  args: {
    level: 1,
    id: "heading-id",
  },
  render() {
    return (
      <ElmHeading {...this.args}>
        <ElmInlineText text="This" color="crimson" /> is{" "}
        <ElmInlineText text="code" code /> !
      </ElmHeading>
    );
  },
};
