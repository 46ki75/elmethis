import { $, component$, useSignal } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmButton } from "./elm-button";
import { ElmTextField, type ElmTextFieldProps } from "./elm-text-field";
import { ElmInlineText } from "../typography/elm-inline-text";

const meta: Meta<ElmTextFieldProps> = {
  title: "Components/Form/elm-text-field",
  component: ElmTextField,
  tags: ["autodocs"],
  args: {
    label: "Email",
    maxLength: 20,
    suffix: "@46ki75.com",
    placeholder: "Enter your email",
    icon: "email",
  },
  argTypes: {
    icon: {
      control: "radio",
      options: [
        undefined,
        "text",
        "pen",
        "email",
        "user",
        "lock",
        "key",
        "earth",
        "tag",
        "archive",
        "link",
        "search",
      ],
    },
  },
};

export default meta;
type Story = StoryObj<ElmTextFieldProps>;

// Uncontrolled: the field manages its own value.
export const Primary: Story = {
  render: (props) => {
    const Render = component$((props: ElmTextFieldProps) => {
      const text = useSignal<string>("");

      return (
        <div>
          <ElmTextField {...props} value={text} />

          <ElmInlineText>{text.value}</ElmInlineText>
        </div>
      );
    });

    return <Render {...props} />;
  },
};
