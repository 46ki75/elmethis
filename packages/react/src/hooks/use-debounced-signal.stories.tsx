import type { Meta, StoryObj } from "@storybook/react-vite";

import { useDebouncedSignal } from "./use-debounced-signal";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const boxStyle = { fontFamily: "monospace", padding: "1rem" };
const inputStyle = { display: "block", marginBottom: "0.5rem", width: "100%" };
const rowStyle = { display: "flex", gap: "0.5rem", marginBottom: "0.5rem" };

// ---------------------------------------------------------------------------
// Demo components
// ---------------------------------------------------------------------------

/**
 * Basic usage: an input whose raw value is reflected in `value` immediately
 * while `debouncedValue` only updates 500 ms after the user stops typing.
 * This is the canonical search-as-you-type pattern.
 */
const BasicDemo = () => {
  const { value, setValue, debouncedValue } = useDebouncedSignal("", 500);

  return (
    <div style={boxStyle}>
      <p>
        Type quickly — <code>value</code> updates on every keystroke,{" "}
        <code>debouncedValue</code> updates 500 ms after you stop.
      </p>
      <input
        style={inputStyle}
        placeholder="Type here…"
        onInput={(e) => setValue(e.currentTarget.value)}
      />
      <p>
        <strong>value (immediate):</strong> {value}
      </p>
      <p>
        <strong>debouncedValue (500 ms):</strong> {debouncedValue}
      </p>
    </div>
  );
};

/**
 * Longer delay: 1 000 ms debounce — useful for heavier operations like
 * API calls that should fire only after the user has clearly paused.
 */
const LongDelayDemo = () => {
  const { value, setValue, debouncedValue } = useDebouncedSignal("", 1000);

  return (
    <div style={boxStyle}>
      <p>Debounce delay: 1 000 ms (simulates an API request trigger).</p>
      <input
        style={inputStyle}
        placeholder="Type here…"
        onInput={(e) => setValue(e.currentTarget.value)}
      />
      <p>
        <strong>value (immediate):</strong> {value}
      </p>
      <p>
        <strong>debouncedValue (1 000 ms):</strong> {debouncedValue}
      </p>
    </div>
  );
};

/**
 * Counter: click rapidly — only the final count is committed to the
 * debounced value. Shows that the timer resets on every write.
 */
const CounterDemo = () => {
  const { value, setValue, debouncedValue } = useDebouncedSignal(0, 400);

  return (
    <div style={boxStyle}>
      <p>Click +1 rapidly — only the last value is debounced.</p>
      <div style={rowStyle}>
        <button onClick={() => setValue((c) => c + 1)}>+1</button>
        <button onClick={() => setValue(0)}>Reset</button>
      </div>
      <p>
        <strong>value (immediate):</strong> {value}
      </p>
      <p>
        <strong>debouncedValue (400 ms):</strong> {debouncedValue}
      </p>
    </div>
  );
};

/**
 * Zero delay: when `delay` is 0, `debouncedValue` is updated
 * synchronously — both values behave identically.
 */
const ZeroDelayDemo = () => {
  const { value, setValue, debouncedValue } = useDebouncedSignal("", 0);

  return (
    <div style={boxStyle}>
      <p>
        With <code>delay=0</code>, <code>debouncedValue</code> updates
        synchronously — same as <code>value</code>.
      </p>
      <input
        style={inputStyle}
        placeholder="Type here…"
        onInput={(e) => setValue(e.currentTarget.value)}
      />
      <p>
        <strong>value:</strong> {value}
      </p>
      <p>
        <strong>debouncedValue:</strong> {debouncedValue}
      </p>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Hooks/useDebouncedSignal",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Basic: Story = {
  render: () => <BasicDemo />,
};

export const LongDelay: Story = {
  render: () => <LongDelayDemo />,
};

export const Counter: Story = {
  render: () => <CounterDemo />,
};

export const ZeroDelay: Story = {
  render: () => <ZeroDelayDemo />,
};
