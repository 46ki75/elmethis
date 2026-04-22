import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  AgUiUserMessage,
  type AgUiUserMessageProps,
} from "./ag-ui-user-message";

const meta: Meta<AgUiUserMessageProps> = {
  title: "Components/AG-UI/ag-ui-user-message",
  component: AgUiUserMessage,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<AgUiUserMessageProps>;

export const Primary: Story = {
  args: {
    text: "What is a new feature called Amazon S3 Files?",
  },
};
