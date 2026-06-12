import { component$, useSignal } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmTextField, type ElmTextFieldProps } from "./elm-text-field";
import { ElmInlineText } from "../typography/elm-inline-text";
import { ElmMdiIcon } from "../icon/elm-mdi-icon";
import { mdiEmail } from "@mdi/js";
import { ElmHeading } from "../typography/elm-heading";
import { useDebouncedSignal } from "../../hooks/use-debounced-signal";

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
      <ElmTextField {...props} value={text} />
      <ElmInlineText>{text.value}</ElmInlineText>
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
      <ElmTextField label="Email" placeholder="Enter your email" value={text}>
        <ElmMdiIcon q:slot="icon" d={mdiEmail} size=".75rem" color="gray" />
      </ElmTextField>
      <ElmInlineText>{text.value}</ElmInlineText>
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
      isLoading={true}
    />
  );
});

export const Loading: Story = {
  render: () => <LoadingTextField />,
};

export const Debounced: Story = {
  render: (props) => {
    const Render = component$((props: ElmTextFieldProps) => {
      const { signal, debouncedSignal } = useDebouncedSignal("", 500);

      return (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <ElmHeading level={2}>Immediate Value: {signal.value}</ElmHeading>
          <ElmTextField {...props} value={signal} />
          <ElmHeading level={2}>
            Debounced Value: {debouncedSignal.value}
          </ElmHeading>
          <ElmTextField {...props} value={debouncedSignal} />
        </div>
      );
    });

    return <Render {...props} />;
  },
};
