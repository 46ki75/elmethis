import { component$ } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";

import { useThrottledStore } from "./use-throttled-store";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

const boxStyle = { fontFamily: "monospace", padding: "1rem" };
const inputStyle = { display: "block", marginBottom: "0.5rem", width: "100%" };
const rowStyle = { display: "flex", gap: "0.5rem", marginBottom: "0.5rem" };
const preStyle = {
  background: "#f4f4f4",
  padding: "0.5rem",
  margin: "0",
  fontSize: "0.85rem",
};

// ---------------------------------------------------------------------------
// Demo components
// ---------------------------------------------------------------------------

/**
 * Basic usage: a search form whose raw state is reflected in `store` on
 * every keystroke while `throttledStore` updates at most once every 500 ms
 * (leading edge). Ideal for live previews where you want to cap the rate
 * of downstream effects such as API calls.
 */
const BasicDemo = component$(() => {
  const { store, throttledStore } = useThrottledStore({ query: "" }, 500);

  return (
    <div style={boxStyle}>
      <p>
        Type quickly — <code>store</code> updates on every keystroke,{" "}
        <code>throttledStore</code> updates at most once every 500 ms.
      </p>
      <input
        style={inputStyle}
        placeholder="Search…"
        onInput$={(_, t) => (store.query = t.value)}
      />
      <p>
        <strong>store (immediate):</strong>
      </p>
      <pre style={preStyle}>{JSON.stringify(store, null, 2)}</pre>
      <p>
        <strong>throttledStore (≤ 1 update / 500 ms):</strong>
      </p>
      <pre style={preStyle}>{JSON.stringify(throttledStore, null, 2)}</pre>
    </div>
  );
});

/**
 * Multi-field form: each field is patched independently. `throttledStore`
 * captures only the leading-edge patch per 600 ms window.
 */
const MultiFieldDemo = component$(() => {
  const { store, throttledStore } = useThrottledStore(
    { first: "", last: "", email: "" },
    600,
  );

  return (
    <div style={boxStyle}>
      <p>
        Edit multiple fields — <code>throttledStore</code> captures at most one
        patch per 600 ms window.
      </p>
      <label style={{ display: "block", marginBottom: "0.25rem" }}>
        First name
        <input
          style={inputStyle}
          placeholder="First"
          onInput$={(_, t) => (store.first = t.value)}
        />
      </label>
      <label style={{ display: "block", marginBottom: "0.25rem" }}>
        Last name
        <input
          style={inputStyle}
          placeholder="Last"
          onInput$={(_, t) => (store.last = t.value)}
        />
      </label>
      <label style={{ display: "block", marginBottom: "0.5rem" }}>
        Email
        <input
          style={inputStyle}
          placeholder="Email"
          onInput$={(_, t) => (store.email = t.value)}
        />
      </label>
      <p>
        <strong>store (immediate):</strong>
      </p>
      <pre style={preStyle}>{JSON.stringify(store, null, 2)}</pre>
      <p>
        <strong>throttledStore (≤ 1 update / 600 ms):</strong>
      </p>
      <pre style={preStyle}>{JSON.stringify(throttledStore, null, 2)}</pre>
    </div>
  );
});

/**
 * Counter: click +1 rapidly — `throttledStore` only picks up the first
 * click in each 400 ms window.
 */
const CounterDemo = component$(() => {
  const { store, throttledStore } = useThrottledStore({ count: 0 }, 400);

  return (
    <div style={boxStyle}>
      <p>
        Click +1 rapidly — <code>throttledStore</code> only picks up the first
        click in each 400 ms window.
      </p>
      <div style={rowStyle}>
        <button onClick$={() => store.count++}>+1</button>
        <button onClick$={() => (store.count = 0)}>Reset</button>
      </div>
      <p>
        <strong>store (immediate):</strong>
      </p>
      <pre style={preStyle}>{JSON.stringify(store, null, 2)}</pre>
      <p>
        <strong>throttledStore (≤ 1 update / 400 ms):</strong>
      </p>
      <pre style={preStyle}>{JSON.stringify(throttledStore, null, 2)}</pre>
    </div>
  );
});

/**
 * Zero interval: when `interval` is 0, `throttledStore` is updated
 * synchronously — same as `store`.
 */
const ZeroIntervalDemo = component$(() => {
  const { store, throttledStore } = useThrottledStore({ query: "" }, 0);

  return (
    <div style={boxStyle}>
      <p>
        With <code>interval=0</code>, <code>throttledStore</code> updates
        synchronously — same as <code>store</code>.
      </p>
      <input
        style={inputStyle}
        placeholder="Type here…"
        onInput$={(_, t) => (store.query = t.value)}
      />
      <p>
        <strong>store:</strong>
      </p>
      <pre style={preStyle}>{JSON.stringify(store, null, 2)}</pre>
      <p>
        <strong>throttledStore:</strong>
      </p>
      <pre style={preStyle}>{JSON.stringify(throttledStore, null, 2)}</pre>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Hooks/useThrottledStore",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => <BasicDemo />,
};

export const MultiField: Story = {
  render: () => <MultiFieldDemo />,
};

export const Counter: Story = {
  render: () => <CounterDemo />,
};

export const ZeroInterval: Story = {
  render: () => <ZeroIntervalDemo />,
};
