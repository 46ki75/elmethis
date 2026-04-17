import type { Meta, StoryObj } from "storybook-framework-qwik";

import { ElmHeading , type ElmHeadingProps} from "./elm-heading";
import { ElmInlineText } from "./elm-inline-text";

const meta: Meta<ElmHeadingProps> = {
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
type Story = StoryObj<ElmHeadingProps>;

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
      <ElmHeading {...(this.args as ElmHeadingProps)}>
        <ElmInlineText text="This" color="crimson" /> is{" "}
        <ElmInlineText text="code" code /> !
      </ElmHeading>
    );
  },
};
