import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmAuthSignIn from "./ElmAuthSignIn.vue";

const meta: Meta<typeof ElmAuthSignIn> = {
  title: "Cognito/Components/ElmAuthSignIn",
  component: ElmAuthSignIn,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
