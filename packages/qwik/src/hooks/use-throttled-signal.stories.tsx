import { component$ } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";

import { useThrottledSignal } from "./use-throttled-signal";

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
 * Basic usage: an input whose raw value is reflected in `signal` on every
 * keystroke while `throttledSignal` updates at most once every 500 ms
 * (leading edge). Useful for live search previews where you want to cap
 * the update rate without waiting for the user to stop typing.
 */
const BasicDemo = component$(() => {
  const { signal, throttledSignal } = useThrottledSignal("", 500);

  return (
    <div style={boxStyle}>
      <p>
        Type quickly — <code>signal</code> updates on every keystroke,{" "}
        <code>throttledSignal</code> updates at most once every 500 ms.
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
        <strong>throttledSignal (≤ 1 update / 500 ms):</strong>{" "}
        {throttledSignal.value}
      </p>
    </div>
  );
});

/**
 * Counter: click +1 rapidly — `throttledSignal` only picks up the first
 * click in each 400 ms window. Illustrates leading-edge throttle behaviour.
 */
const CounterDemo = component$(() => {
  const { signal, throttledSignal } = useThrottledSignal(0, 400);

  return (
    <div style={boxStyle}>
      <p>
        Click +1 rapidly — <code>throttledSignal</code> only picks up the first
        click in each 400 ms window.
      </p>
      <div style={rowStyle}>
        <button onClick$={() => signal.value++}>+1</button>
        <button onClick$={() => (signal.value = 0)}>Reset</button>
      </div>
      <p>
        <strong>signal (immediate):</strong> {signal.value}
      </p>
      <p>
        <strong>throttledSignal (≤ 1 update / 400 ms):</strong>{" "}
        {throttledSignal.value}
      </p>
    </div>
  );
});

/**
 * Short interval: 100 ms throttle — useful for high-frequency events like
 * scroll or pointer move where you still want frequent but capped updates.
 */
const ShortIntervalDemo = component$(() => {
  const { signal, throttledSignal } = useThrottledSignal("", 100);

  return (
    <div style={boxStyle}>
      <p>Throttle interval: 100 ms — high-frequency input, capped updates.</p>
      <input
        style={inputStyle}
        placeholder="Type here…"
        onInput$={(_, t) => (signal.value = t.value)}
      />
      <p>
        <strong>signal (immediate):</strong> {signal.value}
      </p>
      <p>
        <strong>throttledSignal (≤ 1 update / 100 ms):</strong>{" "}
        {throttledSignal.value}
      </p>
    </div>
  );
});

/**
 * Zero interval: when `interval` is 0, `throttledSignal` is updated
 * synchronously — same as `signal`.
 */
const ZeroIntervalDemo = component$(() => {
  const { signal, throttledSignal } = useThrottledSignal("", 0);

  return (
    <div style={boxStyle}>
      <p>
        With <code>interval=0</code>, <code>throttledSignal</code> updates
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
        <strong>throttledSignal:</strong> {throttledSignal.value}
      </p>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Hooks/useThrottledSignal",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

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
