import type { Meta, StoryObj } from "@storybook/vue3-vite";
import ElmAgUiMessageUser from "./ElmAgUiMessageUser.vue";

const meta: Meta<typeof ElmAgUiMessageUser> = {
  title: "AG-UI/Message/ElmAgUiMessageUser",
  component: ElmAgUiMessageUser,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  args: {
    message: {
      id: "cb786c74-7ad8-4eb1-9807-f82c5f787a8c",
      role: "user",
      content: "Is the Rafflesia hard to find?",
    },
  },
};
