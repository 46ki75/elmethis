import { createSignal } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { ElmSlider, type ElmSliderProps } from "./elm-slider";

const meta = {
  title: "Components/Form/elm-slider",
  component: ElmSlider,
  tags: ["autodocs"],
  args: { min: 0, max: 100, step: 1, "aria-label": "Example value" },
} satisfies Meta<typeof ElmSlider>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Primary: Story = {};
export const Vertical: Story = { args: { orientation: "vertical" } };
export const WithStep: Story = { args: { step: 10 } };
export const WithInnerRange: Story = {
  args: { innerMin: 20, innerMax: 80, defaultValue: 20 },
};
export const WithMarkers: Story = { args: { step: 10, markers: true } };
export const WithMarkerLabels: Story = {
  args: { step: 25, markers: true, markerLabels: true },
};
export const WithJsxMarkerLabels: Story = {
  args: {
    orientation: "vertical",
    step: 25,
    markers: true,
    markerLabels: true,
    formatMarkerLabel: (value) => <strong>{value} units</strong>,
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
export const Reversed: Story = {
  args: {
    min: 100,
    max: 0,
    innerMin: 20,
    innerMax: 80,
    defaultValue: 60,
    step: 10,
    markers: true,
    markerLabels: true,
  },
};
export const Disabled: Story = { args: { disabled: true, defaultValue: 40 } };

const ControlledSlider = (props: ElmSliderProps) => {
  const [value, setValue] = createSignal(30);
  return (
    <div style={{ display: "flex", "align-items": "center", gap: "1rem" }}>
      <ElmSlider
        {...props}
        style={{ "max-width": "16rem" }}
        value={value()}
        onValueChange={setValue}
      />
      <span style={{ "font-family": "monospace" }}>value: {value()}</span>
      <button onClick={() => setValue(30)}>Reset</button>
    </div>
  );
};

export const Controlled: Story = {
  render: (args) => <ControlledSlider {...args} />,
};
