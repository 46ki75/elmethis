import { component$, useSignal } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { ElmCheckbox, type ElmCheckboxProps } from "./elm-checkbox";

const meta: Meta<ElmCheckboxProps> = {
  title: "Components/Form/elm-checkbox",
  component: ElmCheckbox,
  tags: ["autodocs"],
  args: {
    label: "Checkbox Label",
    loading: false,
    disable: false,
  },
};

export default meta;
type Story = StoryObj<ElmCheckboxProps>;

// Uncontrolled: the checkbox manages its own checked state.
export const Primary: Story = {
  render() {
    return <ElmCheckbox {...(this.args as ElmCheckboxProps)} />;
  },
};

export const DefaultChecked: Story = {
  render() {
    return (
      <ElmCheckbox {...(this.args as ElmCheckboxProps)} defaultChecked={true} />
    );
  },
};

// Controlled: parent owns the checked state.
const ControlledCheckbox = component$(() => {
  const checked = useSignal(false);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <ElmCheckbox label="Controlled checkbox" checked={checked} />
      <span style={{ fontFamily: "monospace" }}>
        checked: {String(checked.value)}
      </span>
      <button onClick$={() => (checked.value = false)}>Reset</button>
    </div>
  );
});

export const Controlled: Story = {
  render: () => <ControlledCheckbox />,
};
