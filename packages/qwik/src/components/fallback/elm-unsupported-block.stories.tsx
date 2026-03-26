import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmUnsupportedBlock } from "./elm-unsupported-block";

const meta: Meta<typeof ElmUnsupportedBlock> = {
  title: "Components/Fallback/elm-unsupported-block",
  component: ElmUnsupportedBlock,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    details:
      "This is an unsupported block. Please check the details for more information.",
  },
};
