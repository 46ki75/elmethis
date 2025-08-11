import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmCognito from "./ElmCognito.vue";

const meta: Meta<typeof ElmCognito> = {
  title: "Cognito/ElmCognito",
  component: ElmCognito,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
