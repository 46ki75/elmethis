import type { Meta, StoryObj } from "@storybook/vue3";
import Template from "./Template.vue";
import { h } from "vue";

const meta: Meta<typeof Template> = {
  title: "Template/Template/Template",
  component: Template,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {},
  render: (args) => h(Template, { ...args }),
};
