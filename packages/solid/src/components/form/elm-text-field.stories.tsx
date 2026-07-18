import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";
import { mdiEmail } from "@mdi/js";

import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmTextField, type ElmTextFieldProps } from "./elm-text-field";

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

const ControlledTextField = (props: ElmTextFieldProps) => {
  const [text, setText] = createSignal("");
  const [committed, setCommitted] = createSignal("");

  return (
    <div style={{ display: "grid", gap: "0.75rem" }}>
      <ElmTextField
        {...props}
        value={text()}
        onInput={(event) => setText(event.currentTarget.value)}
        onChange={(event) => setCommitted(event.currentTarget.value)}
      />
      <ElmInlineText>Live: {text()}</ElmInlineText>
      <ElmInlineText>Committed: {committed()}</ElmInlineText>
    </div>
  );
};

export const Primary: Story = {
  args: {
    prefix: "user",
    suffix: "@ikuma.cloud",
  },
  render: (args) => <ControlledTextField {...args} />,
};

export const WithIcon: Story = {
  args: {
    icon: <ElmMdiIcon d={mdiEmail} size="0.75rem" color="gray" />,
  },
};

export const Password: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
    isPassword: true,
    suffix: undefined,
  },
};

export const Disabled: Story = {
  args: { value: "example@46ki75.com", disabled: true },
};

export const Loading: Story = { args: { isLoading: true } };
