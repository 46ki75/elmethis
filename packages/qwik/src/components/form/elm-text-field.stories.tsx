import { component$, $ } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmButton } from "./elm-button";
import { ElmTextField, type ElmTextFieldProps } from "./elm-text-field";

const meta: Meta<typeof ElmTextField> = {
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
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

const FocusWrapper = component$(
  (props: Partial<ElmTextFieldProps> & { label?: string }) => {
    const handleClick = $(async () => {
      // Placeholder for focus logic
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
