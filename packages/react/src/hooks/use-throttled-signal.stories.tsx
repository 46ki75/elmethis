import type { Meta, StoryObj } from "@storybook/react-vite";
import type { CSSProperties } from "react";

import { useThrottledSignal } from "./use-throttled-signal";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const boxStyle: CSSProperties = { fontFamily: "monospace", padding: "1rem" };
const inputStyle: CSSProperties = {
  display: "block",
  marginBottom: "0.5rem",
  width: "100%",
};
const rowStyle: CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "0.5rem",
};

// ---------------------------------------------------------------------------
// Demo components
// ---------------------------------------------------------------------------

/**
 * Basic usage: an input whose raw value is reflected in `value` on every
 * keystroke while `throttledValue` updates at most once every 500 ms
 * (leading edge). Useful for live search previews where you want to cap
 * the update rate without waiting for the user to stop typing.
 */
const BasicDemo = () => {
  const { value, setValue, throttledValue } = useThrottledSignal("", 500);

  return (
    <div style={boxStyle}>
      <p>
        Type quickly — <code>value</code> updates on every keystroke,{" "}
        <code>throttledValue</code> updates at most once every 500 ms.
      </p>
      <input
        style={inputStyle}
        placeholder="Type here…"
        onChange={(e) => setValue(e.target.value)}
      />
      <p>
        <strong>value (immediate):</strong> {value}
      </p>
      <p>
        <strong>throttledValue (≤ 1 update / 500 ms):</strong> {throttledValue}
      </p>
    </div>
  );
};

/**
 * Counter: click +1 rapidly — `throttledValue` only picks up the first
 * click in each 400 ms window. Illustrates leading-edge throttle behavior.
 */
const CounterDemo = () => {
  const { value, setValue, throttledValue } = useThrottledSignal(0, 400);

  return (
    <div style={boxStyle}>
      <p>
        Click +1 rapidly — <code>throttledValue</code> only picks up the first
        click in each 400 ms window.
      </p>
      <div style={rowStyle}>
        <button onClick={() => setValue((prev) => prev + 1)}>+1</button>
        <button onClick={() => setValue(0)}>Reset</button>
      </div>
      <p>
        <strong>value (immediate):</strong> {value}
      </p>
      <p>
        <strong>throttledValue (≤ 1 update / 400 ms):</strong> {throttledValue}
      </p>
    </div>
  );
};

/**
 * Short interval: 100 ms throttle — useful for high-frequency events like
 * scroll or pointer move where you still want frequent but capped updates.
 */
const ShortIntervalDemo = () => {
  const { value, setValue, throttledValue } = useThrottledSignal("", 100);

  return (
    <div style={boxStyle}>
      <p>Throttle interval: 100 ms — high-frequency input, capped updates.</p>
      <input
        style={inputStyle}
        placeholder="Type here…"
        onChange={(e) => setValue(e.target.value)}
      />
      <p>
        <strong>value (immediate):</strong> {value}
      </p>
      <p>
        <strong>throttledValue (≤ 1 update / 100 ms):</strong> {throttledValue}
      </p>
    </div>
  );
};

/**
 * Zero interval: when `interval` is 0, `throttledValue` is updated
 * synchronously — same as `value`.
 */
const ZeroIntervalDemo = () => {
  const { value, setValue, throttledValue } = useThrottledSignal("", 0);

  return (
    <div style={boxStyle}>
      <p>
        With <code>interval=0</code>, <code>throttledValue</code> updates
        synchronously — same as <code>value</code>.
      </p>
      <input
        style={inputStyle}
        placeholder="Type here…"
        onChange={(e) => setValue(e.target.value)}
      />
      <p>
        <strong>value:</strong> {value}
      </p>
      <p>
        <strong>throttledValue:</strong> {throttledValue}
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Hooks/useThrottledSignal",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => <BasicDemo />,
};

export const Counter: Story = {
  render: () => <CounterDemo />,
};

export const ShortInterval: Story = {
  render: () => <ShortIntervalDemo />,
};

export const ZeroInterval: Story = {
  render: () => <ZeroIntervalDemo />,
};
