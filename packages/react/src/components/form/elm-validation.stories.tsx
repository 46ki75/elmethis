import type { Meta, StoryObj } from "@storybook/react-vite";
import { useMemo, useState } from "react";

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
  const [input, setInput] = useState("");

  const isValidA = useMemo(() => input.length >= 8, [input]);
  const isValidB = useMemo(() => /.*\d.*/.test(input), [input]);
  const isValidC = useMemo(() => /.*[a-z].*/.test(input), [input]);
  const isValidD = useMemo(() => /.*[A-Z].*/.test(input), [input]);

  return (
    <>
      <input
        type="password"
        value={input}
        onChange={(event) => setInput(event.target.value)}
        placeholder="Enter password..."
      />
      <div style={{ marginBlock: "1rem" }}></div>
      <ElmValidation
        text="Password must be at least 8 characters"
        isValid={isValidA}
      />
      <ElmValidation text="Password must contain a number" isValid={isValidB} />
      <ElmValidation
        text="Password must contain a lower letter"
        isValid={isValidC}
      />
      <ElmValidation
        text="Password must contain an uppercase letter"
        isValid={isValidD}
      />
    </>
  );
};

export const Interactive: Story = {
  render: () => <InteractiveStory />,
};
