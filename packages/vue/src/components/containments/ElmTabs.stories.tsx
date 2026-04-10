import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmTabs from "./ElmTabs.vue";

const meta: Meta<typeof ElmTabs> = {
  title: "Components/Containments/ElmTabs",
  component: ElmTabs,
  tags: ["autodocs"],
  args: {
    tabLabels: ["Tab 1", "Tab 2", "Tab 3"],
    tabContents: [
      "This is the content for Tab 1.",
      "This is the content for Tab 2.",
      "This is the content for Tab 3.",
    ],
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
