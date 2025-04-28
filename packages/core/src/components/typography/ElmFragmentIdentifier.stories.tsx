import type { Meta, StoryObj } from "@storybook/vue3";
import ElmFragmentIdentifier from "./ElmFragmentIdentifier.vue";

const meta: Meta<typeof ElmFragmentIdentifier> = {
  title: "Components/Typography/ElmFragmentIdentifier",
  component: ElmFragmentIdentifier,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
