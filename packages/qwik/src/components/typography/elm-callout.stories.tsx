import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmCallout } from "./elm-callout";

const meta: Meta<typeof ElmCallout> = {
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
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
