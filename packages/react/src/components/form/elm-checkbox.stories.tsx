import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

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

// Uncontrolled: the checkbox manages its own checked state.
export const Primary: Story = {};

export const DefaultChecked: Story = {
  args: {
    defaultChecked: true,
  },
};

export const Loading: Story = {
  args: {
    isLoading: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
  },
};

// Controlled: parent owns the checked state.
export const Controlled: Story = {
  render: (args) => {
    const ControlledCheckbox = () => {
      const [checked, setChecked] = useState(false);

      return (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <ElmCheckbox
            {...args}
            label="Controlled checkbox"
            checked={checked}
            onCheckedChange={setChecked}
          />
          <span style={{ fontFamily: "monospace" }}>
            checked: {String(checked)}
          </span>
          <button onClick={() => setChecked(false)}>Reset</button>
        </div>
      );
    };

    return <ControlledCheckbox />;
  },
};
