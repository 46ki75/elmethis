import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
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

// The switch's checked state is owned by the story harness.
const SwitchHarness = (args: ElmSwitchProps) => {
  const [checked, setChecked] = useState(false);
  return <ElmSwitch {...args} checked={checked} onCheckedChange={setChecked} />;
};

export const Primary: Story = {
  render: (args) => <SwitchHarness {...args} />,
};
