import { useComputed$, useSignal } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmTextField } from "./elm-text-field";
import { ElmValidation } from "./elm-validation";

const meta: Meta<typeof ElmValidation> = {
  title: "Components/Form/elm-validation",
  component: ElmValidation,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {
  render: (args: any) => {
    const input = useSignal("");

    const isValidA = useComputed$(() => input.value.length >= 8);
    const isValidB = useComputed$(() => /.*\d.*/.test(input.value));
    const isValidC = useComputed$(() => /.*[a-z].*/.test(input.value));
    const isValidD = useComputed$(() => /.*[A-Z].*/.test(input.value));

    return (
      <>
        <ElmTextField
          value={input}
          label="Password"
          isPassword
          placeholder="Enter password..."
        />
        <div style="margin-block: 1rem;"></div>
        <ElmValidation
          text="Password must be at least 8 characters"
          isValid={isValidA.value}
        />
        <ElmValidation
          text="Password must contain a number"
          isValid={isValidB.value}
        />
        <ElmValidation
          text="Password must contain a lower letter"
          isValid={isValidC.value}
        />
        <ElmValidation
          text="Password must contain an uppercase letter"
          isValid={isValidD.value}
        />
      </>
    );
  },
};
