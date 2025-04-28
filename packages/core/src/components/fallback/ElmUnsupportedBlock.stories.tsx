import type { Meta, StoryObj } from "@storybook/vue3";
import UnsupportedBlock from "./ElmUnsupportedBlock.vue";

const meta: Meta<typeof UnsupportedBlock> = {
  title: "Components/Fallback/UnsupportedBlock",
  component: UnsupportedBlock,
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
