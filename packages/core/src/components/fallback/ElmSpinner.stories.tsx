import type { Meta, StoryObj } from "@storybook/vue3";
import ElmSpinner from "./ElmSpinner.vue";

const meta: Meta<typeof ElmSpinner> = {
  title: "Components/Fallback/ElmSpinner",
  component: ElmSpinner,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
