import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmUnsupportedBlock,
  type ElmUnsupportedBlockProps,
} from "./elm-unsupported-block";

const meta: Meta<ElmUnsupportedBlockProps> = {
  title: "Components/Fallback/elm-unsupported-block",
  component: ElmUnsupportedBlock,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmUnsupportedBlockProps>;

export const Primary: Story = {
  args: {
    details:
      "This is an unsupported block. Please check the details for more information.",
  },
};
