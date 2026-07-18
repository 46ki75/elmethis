import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmSwitch, type ElmSwitchProps } from "./elm-switch";

const meta = {
  title: "Components/Form/elm-switch",
  component: ElmSwitch,
  tags: ["autodocs"],
  args: {
    checked: false,
    size: "18px",
    disabled: false,
  },
  argTypes: {
    color: { control: "color" },
  },
} satisfies Meta<typeof ElmSwitch>;

export default meta;
type Story = StoryObj<typeof meta>;

const SwitchHarness = (props: ElmSwitchProps) => {
  const [checked, setChecked] = createSignal(false);
  return (
    <ElmSwitch {...props} checked={checked()} onCheckedChange={setChecked} />
  );
};

export const Primary: Story = {
  render: (args) => <SwitchHarness {...args} />,
};
