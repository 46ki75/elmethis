import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmAuthSignInPassword from "./ElmAuthSignInPassword.vue";

const meta: Meta<typeof ElmAuthSignInPassword> = {
  title: "Cognito/Components/ElmAuthSignInPassword",
  component: ElmAuthSignInPassword,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
