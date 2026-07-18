import { createMemo, createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmValidation } from "./elm-validation";

const meta = {
  title: "Components/Form/elm-validation",
  component: ElmValidation,
  tags: ["autodocs"],
  args: {
    text: "Password must be at least 8 characters",
    isValid: false,
  },
  argTypes: {
    validColor: { control: "color" },
  },
} satisfies Meta<typeof ElmValidation>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const Valid: Story = {
  args: {
    text: "Password is valid",
    isValid: true,
  },
};

const InteractiveStory = () => {
  const [input, setInput] = createSignal("");
  const hasLength = createMemo(() => input().length >= 8);
  const hasNumber = createMemo(() => /\d/.test(input()));
  const hasLowercase = createMemo(() => /[a-z]/.test(input()));
  const hasUppercase = createMemo(() => /[A-Z]/.test(input()));

  return (
    <>
      <input
        type="password"
        value={input()}
        onInput={(event) => setInput(event.currentTarget.value)}
        placeholder="Enter password..."
      />
      <div style={{ "margin-block": "1rem" }} />
      <ElmValidation
        text="Password must be at least 8 characters"
        isValid={hasLength()}
      />
      <ElmValidation
        text="Password must contain a number"
        isValid={hasNumber()}
      />
      <ElmValidation
        text="Password must contain a lower letter"
        isValid={hasLowercase()}
      />
      <ElmValidation
        text="Password must contain an uppercase letter"
        isValid={hasUppercase()}
      />
    </>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveStory />,
};
