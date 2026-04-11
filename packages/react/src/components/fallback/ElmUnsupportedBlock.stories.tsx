import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmUnsupportedBlock } from "./ElmUnsupportedBlock";

const meta: Meta<typeof ElmUnsupportedBlock> = {
  title: "Components/Fallback/ElmUnsupportedBlock",
  component: ElmUnsupportedBlock,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    details:
      "Neque porro quisquam est qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit...",
  },
};
