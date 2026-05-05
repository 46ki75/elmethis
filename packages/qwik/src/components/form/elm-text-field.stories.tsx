import { $, component$, useSignal } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmButton } from "./elm-button";
import { ElmTextField, type ElmTextFieldProps } from "./elm-text-field";

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
export const Primary: Story = {};

const FocusWrapper = component$(
  (props: Partial<ElmTextFieldProps> & { label?: string }) => {
    const handleClick = $(async () => {
      console.log("Focus requested - this requires component implementation");
    });

    return (
      <>
        <ElmTextField label={props.label || "Focus Field"} {...props} />
        <ElmButton onClick$={handleClick}>Focus</ElmButton>
      </>
    );
  },
);

export const Focus: Story = {
  render() {
    return <FocusWrapper {...this.args} />;
  },
};

// Controlled: parent owns the value.
const ControlledTextField = component$(() => {
  const value = useSignal("");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <ElmTextField
        label="Controlled field"
        value={value.value}
        onValueChange$={$((v) => {
          value.value = v;
        })}
        placeholder="Type something..."
      />
      <div style={{ fontFamily: "monospace", fontSize: "0.85rem" }}>
        value: {JSON.stringify(value.value)}
      </div>
      <button onClick$={() => (value.value = "")}>Clear</button>
    </div>
  );
});

export const Controlled: Story = {
  render: () => <ControlledTextField />,
};
