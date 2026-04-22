import type { Meta, StoryObj } from "storybook-framework-qwik";
import {
  ElmAgUiUserMessage,
  type ElmAgUiUserMessageProps,
} from "./elm-ag-ui-user-message";

const meta: Meta<ElmAgUiUserMessageProps> = {
  title: "Components/AG-UI/elm-ag-ui-user-message",
  component: ElmAgUiUserMessage,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmAgUiUserMessageProps>;

export const Primary: Story = {
  args: {
    text: "What is a new feature called Amazon S3 Files?",
  },
};
