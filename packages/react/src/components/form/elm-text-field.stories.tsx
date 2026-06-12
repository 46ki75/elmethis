import { useState, type ComponentProps } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { mdiEmail } from "@mdi/js";

import { ElmTextField } from "./elm-text-field";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";

const meta = {
  title: "Components/Form/elm-text-field",
  component: ElmTextField,
  tags: ["autodocs"],
  args: {
    label: "Email",
    maxLength: 20,
    suffix: "@46ki75.com",
    placeholder: "Enter your email",
  },
} satisfies Meta<typeof ElmTextField>;

export default meta;
type Story = StoryObj<typeof meta>;

const PrimaryStory = (args: ComponentProps<typeof ElmTextField>) => {
  const [text, setText] = useState("");
  return (
    <div>
      <ElmTextField
        {...args}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <ElmTextField
        {...args}
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <ElmInlineText>{text}</ElmInlineText>
    </div>
  );
};

export const Primary: Story = {
  args: {
    label: "Email",
    maxLength: 20,
    prefix: "user",
    suffix: "@ikuma.cloud",
    placeholder: "Enter your email",
    required: false,
  },
  render: (args) => <PrimaryStory {...args} />,
};

const WithIconStory = () => {
  const [text, setText] = useState("");
  return (
    <div>
      <ElmTextField
        label="Email"
        placeholder="Enter your email"
        value={text}
        onChange={(e) => setText(e.target.value)}
        icon={<ElmMdiIcon d={mdiEmail} size=".75rem" color="gray" />}
      />
      <ElmInlineText>{text}</ElmInlineText>
    </div>
  );
};

export const WithIcon: Story = {
  render: () => <WithIconStory />,
};

const PasswordStory = () => {
  const [text, setText] = useState("");
  return (
    <ElmTextField
      label="Password"
      placeholder="Enter your password"
      isPassword
      value={text}
      onChange={(e) => setText(e.target.value)}
    />
  );
};

export const Password: Story = {
  render: () => <PasswordStory />,
};

const DisabledStory = () => {
  const [text, setText] = useState("example@46ki75.com");
  return (
    <ElmTextField
      label="Email"
      placeholder="Enter your email"
      value={text}
      onChange={(e) => setText(e.target.value)}
      disabled
    />
  );
};

export const Disabled: Story = {
  render: () => <DisabledStory />,
};

const LoadingStory = () => {
  const [text, setText] = useState("");
  return (
    <ElmTextField
      label="Email"
      placeholder="Enter your email"
      value={text}
      onChange={(e) => setText(e.target.value)}
      isLoading
    />
  );
};

export const Loading: Story = {
  render: () => <LoadingStory />,
};
