import type { Meta, StoryObj } from "@storybook/vue3";
import ElmColorSample from "./ElmColorSample.vue";

const meta: Meta<typeof ElmColorSample> = {
  title: "Components/Others/ElmColorSample",
  component: ElmColorSample,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    color: "#59b57c",
  },
};
