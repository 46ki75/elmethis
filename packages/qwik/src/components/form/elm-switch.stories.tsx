import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmSwitch, type ElmSwitchProps } from "./elm-switch";
import { component$, useSignal } from "@builder.io/qwik";

const meta: Meta<ElmSwitchProps> = {
  title: "Components/Form/elm-switch",
  component: ElmSwitch,
  tags: ["autodocs"],
  args: {
    color: "#bfa056",
    size: "18px",
    disabled: false,
  },
};

export default meta;
type Story = StoryObj<ElmSwitchProps>;

// Uncontrolled: the switch manages its own state.
export const Primary: Story = {
  render(args) {
    const Render = component$((args: ElmSwitchProps) => {
      const checked = useSignal<boolean>(false);

      return <ElmSwitch {...args} checked={checked} />;
    });
    return <Render {...args} />;
  },
};
