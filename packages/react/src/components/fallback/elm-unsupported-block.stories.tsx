import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmUnsupportedBlock } from "./elm-unsupported-block";

const meta = {
  title: "Components/Fallback/elm-unsupported-block",
  component: ElmUnsupportedBlock,
  tags: ["autodocs"],
  args: {},
} satisfies Meta<typeof ElmUnsupportedBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    details:
      "This is an unsupported block. Please check the details for more information.",
  },
};
