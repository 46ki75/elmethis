import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";

import { ElmSlider } from "./elm-slider";

const meta = {
  title: "Components/Form/elm-slider",
  component: ElmSlider,
  tags: ["autodocs"],
  args: {
    min: 0,
    max: 100,
    step: 1,
  },
} satisfies Meta<typeof ElmSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

// Uncontrolled: the slider manages its own value, starting at the midpoint.
export const Primary: Story = {};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
};

export const WithStep: Story = {
  args: {
    step: 10,
  },
};

export const WithInnerRange: Story = {
  args: {
    innerMin: 20,
    innerMax: 80,
    defaultValue: 20,
  },
};

export const WithMarkers: Story = {
  args: {
    step: 10,
    markers: true,
  },
};

export const WithMarkerLabels: Story = {
  args: {
    step: 25,
    markers: true,
    markerLabels: true,
  },
};

export const WithMarkersAndInnerRange: Story = {
  args: {
    step: 10,
    innerMin: 20,
    innerMax: 80,
    defaultValue: 20,
    markers: true,
    markerLabels: true,
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 40,
  },
};

// Controlled: parent owns the value.
export const Controlled: Story = {
  render: (args) => {
    const ControlledSlider = () => {
      const [value, setValue] = useState(30);

      return (
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <ElmSlider
            {...args}
            style={{ maxWidth: "16rem" }}
            value={value}
            onValueChange={setValue}
          />
          <span style={{ fontFamily: "monospace" }}>value: {value}</span>
          <button onClick={() => setValue(30)}>Reset</button>
        </div>
      );
    };

    return <ControlledSlider />;
  },
};
