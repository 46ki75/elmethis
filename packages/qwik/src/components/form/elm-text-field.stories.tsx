import { component$, useSignal } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmTextField, type ElmTextFieldProps } from "./elm-text-field";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiEmail } from "@mdi/js";

const meta: Meta<ElmTextFieldProps> = {
  title: "Components/Form/elm-text-field",
  component: ElmTextField,
  tags: ["autodocs"],
  args: {
    label: "Email",
    maxLength: 20,
    suffix: "@46ki75.com",
    placeholder: "Enter your email",
  },
};

export default meta;
type Story = StoryObj<ElmTextFieldProps>;

const PrimaryTextField = component$((props: ElmTextFieldProps) => {
  const text = useSignal<string>("");
  return (
    <div>
      <ElmTextField {...props} value={text} />
      <ElmInlineText text={text.value} />
    </div>
  );
});

export const Primary: Story = {
  args: {
    label: "Email",
    maxLength: 20,
    prefix: "user",
    suffix: "@ikuma.cloud",
    placeholder: "Enter your email",
    required: false,
  },
  render: (props) => <PrimaryTextField {...props} />,
};

const WithIconTextField = component$(() => {
  const text = useSignal<string>("");
  return (
    <div>
      <ElmTextField
        label="Email"
        placeholder="Enter your email"
        icon={<ElmMdiIcon d={mdiEmail} size="1.5rem" color="gray" />}
        value={text}
      />
      <ElmInlineText text={text.value} />
    </div>
  );
});

export const WithIcon: Story = {
  render: () => <WithIconTextField />,
};

const PasswordTextField = component$(() => {
  const text = useSignal<string>("");
  return (
    <ElmTextField
      label="Password"
      placeholder="Enter your password"
      isPassword={true}
      value={text}
    />
  );
});

export const Password: Story = {
  render: () => <PasswordTextField />,
};

const DisabledTextField = component$(() => {
  const text = useSignal<string>("example@46ki75.com");
  return (
    <ElmTextField
      label="Email"
      placeholder="Enter your email"
      value={text}
      disabled={true}
    />
  );
});

export const Disabled: Story = {
  render: () => <DisabledTextField />,
};

const LoadingTextField = component$(() => {
  const text = useSignal<string>("");
  return (
    <ElmTextField
      label="Email"
      placeholder="Enter your email"
      value={text}
      loading={true}
    />
  );
});

export const Loading: Story = {
  render: () => <LoadingTextField />,
};
