import { useSignal } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmSwitch } from "./elm-switch";

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

export const Primary: Story = {
  render: (args: any) => {
    const checked = useSignal(false);
    return <ElmSwitch {...args} checked={checked} />;
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

export const CustomColor: Story = {
  args: {
    color: "red",
  },
};
