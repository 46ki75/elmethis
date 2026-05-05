import { $, component$, useSignal } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmSwitch, type ElmSwitchProps } from "./elm-switch";

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
  render() {
    return <ElmSwitch {...this.args} defaultChecked={false} />;
  },
};

export const DefaultChecked: Story = {
  render() {
    return <ElmSwitch {...this.args} defaultChecked={true} />;
  },
};

export const Disabled: Story = {
  render() {
    return <ElmSwitch {...this.args} disabled={true} />;
  },
};

export const CustomColor: Story = {
  render() {
    return <ElmSwitch {...this.args} color="red" />;
  },
};

// Controlled: parent owns the checked state.
const ControlledSwitch = component$(() => {
  const checked = useSignal(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <ElmSwitch
        checked={checked.value}
        onCheckedChange$={$((v) => {
          checked.value = v;
        })}
      />
      <span style={{ fontFamily: "monospace" }}>
        checked: {String(checked.value)}
      </span>
      <button onClick$={() => (checked.value = false)}>Reset</button>
    </div>
  );
});

export const Controlled: Story = {
  render: () => <ControlledSwitch />,
};
