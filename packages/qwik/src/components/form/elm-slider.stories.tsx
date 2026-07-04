import { component$, useSignal } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";

import { ElmSlider, type ElmSliderProps } from "./elm-slider";

const meta: Meta<ElmSliderProps> = {
  title: "Components/Form/elm-slider",
  component: ElmSlider,
  tags: ["autodocs"],
  args: {
    min: 0,
    max: 100,
    step: 1,
  },
};

export default meta;
type Story = StoryObj<ElmSliderProps>;

// Uncontrolled: the slider manages its own value, starting at the midpoint.
export const Primary: Story = {
  render() {
    return <ElmSlider {...(this.args as ElmSliderProps)} />;
  },
};

export const Vertical: Story = {
  args: {
    orientation: "vertical",
  },
  render() {
    return <ElmSlider {...(this.args as ElmSliderProps)} />;
  },
};

export const WithStep: Story = {
  args: {
    step: 10,
  },
  render() {
    return <ElmSlider {...(this.args as ElmSliderProps)} />;
  },
};

export const WithInnerRange: Story = {
  args: {
    innerMin: 20,
    innerMax: 80,
    defaultValue: 20,
  },
  render() {
    return <ElmSlider {...(this.args as ElmSliderProps)} />;
  },
};

export const WithMarkers: Story = {
  args: {
    step: 10,
    markers: true,
  },
  render() {
    return <ElmSlider {...(this.args as ElmSliderProps)} />;
  },
};

export const WithMarkerLabels: Story = {
  args: {
    step: 25,
    markers: true,
    markerLabels: true,
  },
  render() {
    return <ElmSlider {...(this.args as ElmSliderProps)} />;
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
  render() {
    return <ElmSlider {...(this.args as ElmSliderProps)} />;
  },
};

export const Disabled: Story = {
  args: {
    disabled: true,
    defaultValue: 40,
  },
  render() {
    return <ElmSlider {...(this.args as ElmSliderProps)} />;
  },
};

// Controlled: parent owns the value via a bound Signal.
const ControlledSlider = component$<ElmSliderProps>((props) => {
  const value = useSignal(30);

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
      <ElmSlider {...props} style={{ maxWidth: "16rem" }} value={value} />
      <span style={{ fontFamily: "monospace" }}>value: {value.value}</span>
      <button onClick$={() => (value.value = 30)}>Reset</button>
    </div>
  );
});

export const Controlled: Story = {
  render(args) {
    return <ControlledSlider {...(args as ElmSliderProps)} />;
  },
};
