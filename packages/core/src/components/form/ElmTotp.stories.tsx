import type { Meta, StoryObj } from "@storybook/vue3";
import ElmTotp from "./ElmTotp.vue";

const meta: Meta<typeof ElmTotp> = {
  title: "Components/Form/ElmTotp",
  component: ElmTotp,
  tags: ["autodocs"],
  args: {
    length: 6,
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
