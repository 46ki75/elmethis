import { component$, useSignal } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmAgUiInput, type ElmAgUiInputProps } from "./elm-ag-ui-input";

const meta: Meta<ElmAgUiInputProps> = {
  title: "Components/AG-UI/elm-ag-ui-input",
  component: ElmAgUiInput,
  tags: ["autodocs"],
  args: {},
};

export default meta;
type Story = StoryObj<ElmAgUiInputProps>;

export const Primary: Story = {
  args: {},
  render: (args) => {
    const Render = component$((props: ElmAgUiInputProps) => {
      const input = useSignal("");

      return (
        <ElmAgUiInput
          {...props}
          onInput$={(event, element) => {
            input.value = element.value;
            console.log("Input value:", input.value);
          }}
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          onSubmit$={(event, element) => {
            console.log("Submitted value:", input.value);
          }}
        />
      );
    });

    return <Render {...args} />;
  },
};
