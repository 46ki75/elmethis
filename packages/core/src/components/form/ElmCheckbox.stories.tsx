import type { Meta, StoryObj } from "@storybook/vue3";
import ElmCheckbox from "./ElmCheckbox.vue";

const meta: Meta<typeof ElmCheckbox> = {
  title: "Components/Form/ElmCheckbox",
  component: ElmCheckbox,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: { label: "Checkbox" },
};
