import { component$, useSignal } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmSwitch, type ElmSwitchProps } from "./elm-switch";

const meta: Meta<typeof ElmSwitch> = {
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
type Story = StoryObj<typeof meta>;

const SwitchWrapper = component$((props: Partial<ElmSwitchProps>) => {
  const checked = useSignal(false);
  return <ElmSwitch {...props} checked={checked} />;
});

export const Primary: Story = {
  render() {
    return <SwitchWrapper {...this.args} />;
  },
};

export const Disabled: Story = {
  render() {
    return <SwitchWrapper {...this.args} disabled={true} />;
  },
};

export const CustomColor: Story = {
  render() {
    return <SwitchWrapper {...this.args} color="red" />;
  },
};
