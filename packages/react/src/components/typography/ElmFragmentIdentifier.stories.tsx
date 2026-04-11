import type { Meta, StoryObj } from "@storybook/react-vite";
import { ElmFragmentIdentifier } from "./ElmFragmentIdentifier";

const meta: Meta<typeof ElmFragmentIdentifier> = {
  title: "Components/Typography/ElmFragmentIdentifier",
  component: ElmFragmentIdentifier,
  tags: ["autodocs"],
  args: {
    id: "example-heading",
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
