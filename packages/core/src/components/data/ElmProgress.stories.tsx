import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmProgress from "./ElmProgress.vue";

const meta: Meta<typeof ElmProgress> = {
  title: "Components/Data/ElmProgress",
  component: ElmProgress,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    value: 50,
  },
};

export const WithBuffer: Story = {
  args: {
    value: 50,
    buffer: 70,
  },
};

export const Bold: Story = {
  args: {
    value: 50,
    buffer: 70,
    weight: "16px",
  },
};

export const WithColor: Story = {
  args: {
    value: 50,
    buffer: 70,
    color: "#b36472",
  },
};

export const Loading: Story = {
  args: {
    value: 50,
    buffer: 70,
    loading: true,
  },
};
