import type { Meta, StoryObj } from "@storybook/vue3";
import ElmTemplate from "./ElmTemplate.vue";

const meta: Meta<typeof ElmTemplate> = {
  title: "Template/Template/ElmTemplate",
  component: ElmTemplate,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
