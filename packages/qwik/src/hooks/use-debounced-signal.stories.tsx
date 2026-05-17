import { component$ } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";

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
 * Basic usage: an input whose raw value is reflected in `signal` immediately
 * while `debouncedSignal` only updates 500 ms after the user stops typing.
 * This is the canonical search-as-you-type pattern.
 */
const BasicDemo = component$(() => {
  const { signal, debouncedSignal } = useDebouncedSignal("", 500);

  return (
    <div style={boxStyle}>
      <p>
        Type quickly — <code>signal</code> updates on every keystroke,{" "}
        <code>debouncedSignal</code> updates 500 ms after you stop.
      </p>
      <input
        style={inputStyle}
        placeholder="Type here…"
        onInput$={(_, t) => (signal.value = t.value)}
      />
      <p>
        <strong>signal (immediate):</strong> {signal.value}
      </p>
      <p>
        <strong>debouncedSignal (500 ms):</strong> {debouncedSignal.value}
      </p>
    </div>
  );
});

/**
 * Longer delay: 1 000 ms debounce — useful for heavier operations like
 * API calls that should fire only after the user has clearly paused.
 */
const LongDelayDemo = component$(() => {
  const { signal, debouncedSignal } = useDebouncedSignal("", 1000);

  return (
    <div style={boxStyle}>
      <p>Debounce delay: 1 000 ms (simulates an API request trigger).</p>
      <input
        style={inputStyle}
        placeholder="Type here…"
        onInput$={(_, t) => (signal.value = t.value)}
      />
      <p>
        <strong>signal (immediate):</strong> {signal.value}
      </p>
      <p>
        <strong>debouncedSignal (1 000 ms):</strong> {debouncedSignal.value}
      </p>
    </div>
  );
});

/**
 * Counter: click rapidly — only the final count is committed to the
 * debounced signal.  Shows that the timer resets on every call to `set`.
 */
const CounterDemo = component$(() => {
  const { signal, debouncedSignal } = useDebouncedSignal(0, 400);

  return (
    <div style={boxStyle}>
      <p>Click +1 rapidly — only the last value is debounced.</p>
      <div style={rowStyle}>
        <button onClick$={() => signal.value++}>+1</button>
        <button onClick$={() => (signal.value = 0)}>Reset</button>
      </div>
      <p>
        <strong>signal (immediate):</strong> {signal.value}
      </p>
      <p>
        <strong>debouncedSignal (400 ms):</strong> {debouncedSignal.value}
      </p>
    </div>
  );
});

/**
 * Zero delay: when `delay` is 0, `debouncedSignal` is updated
 * synchronously — both signals behave identically.
 */
const ZeroDelayDemo = component$(() => {
  const { signal, debouncedSignal } = useDebouncedSignal("", 0);

  return (
    <div style={boxStyle}>
      <p>
        With <code>delay=0</code>, <code>debouncedSignal</code> updates
        synchronously — same as <code>signal</code>.
      </p>
      <input
        style={inputStyle}
        placeholder="Type here…"
        onInput$={(_, t) => (signal.value = t.value)}
      />
      <p>
        <strong>signal:</strong> {signal.value}
      </p>
      <p>
        <strong>debouncedSignal:</strong> {debouncedSignal.value}
      </p>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Hooks/useDebouncedSignal",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

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
