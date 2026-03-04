import { $ } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmButton } from "./elm-button";
import { ElmTextField } from "./elm-text-field";

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

export const Focus: Story = {
  render: (args: any) => {
    // Note: Imperative focus is not directly supported via ref in the ported component yet without extra implementation.
    // However, we can simulate the "Need" for this story by just rendering the structure from Vue.
    // Since we don't have a direct imperative handle exposed in the Qwik component (without useImperativeHandle logic or explicit context/signal based focus control),
    // we'll just implement the visual part.
    // If specific focus behavior is required, the component implementation needs to be updated to expose a focus method or take a 'focus' signal.

    const handleClick = $(async () => {
      // Placeholder for focus logic
      console.log("Focus requested - this requires component implementation");
    });

    return (
      <>
        <ElmTextField {...args} />
        <ElmButton onClick$={handleClick}>Focus</ElmButton>
      </>
    );
  },
};
