import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmCallout } from "./elm-callout";
import { ElmInlineText } from "./elm-inline-text";

const lorem =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nullam nec purus nec nunc tincidunt aliquam. Nullam nec purus nec nunc tincidunt aliquam.";

const meta: Meta<typeof ElmCallout> = {
  title: "Components/Typography/elm-callout",
  component: ElmCallout,
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "radio",
      options: ["note", "tip", "important", "warning", "caution"],
    },
  },
  args: {},
  render() {
    return (
      <ElmCallout {...this.args}>
        <ElmInlineText text={lorem} />
      </ElmCallout>
    );
  },
};

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
