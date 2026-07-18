import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmCheckbox } from "./elm-checkbox";

const meta = {
  title: "Components/Form/elm-checkbox",
  component: ElmCheckbox,
  tags: ["autodocs"],
  args: {
    label: "Checkbox Label",
    isLoading: false,
    disabled: false,
  },
} satisfies Meta<typeof ElmCheckbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};

export const DefaultChecked: Story = { args: { defaultChecked: true } };

export const Loading: Story = { args: { isLoading: true } };

export const Disabled: Story = { args: { disabled: true } };

const ControlledCheckbox = (props: { label: string }) => {
  const [checked, setChecked] = createSignal(false);

  return (
    <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
      <ElmCheckbox
        label={props.label}
        checked={checked()}
        onCheckedChange={setChecked}
      />
      <span style={{ "font-family": "monospace" }}>
        checked: {String(checked())}
      </span>
      <button onClick={() => setChecked(false)}>Reset</button>
    </div>
  );
};

export const Controlled: Story = {
  render: (args) => <ControlledCheckbox label={args.label} />,
};
