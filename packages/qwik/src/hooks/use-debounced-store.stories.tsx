import { component$ } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";

import { useDebouncedStore } from "./use-debounced-store";

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
 * Basic usage: a search form whose raw state is reflected in `store`
 * immediately while `debouncedStore` only updates 500 ms after the user
 * stops typing. `debouncedStore` is what you'd pass to an API call.
 */
const BasicDemo = component$(() => {
  const { store, debouncedStore } = useDebouncedStore({ query: "" }, 500);

  return (
    <div style={boxStyle}>
      <p>
        Type quickly — <code>store</code> updates on every keystroke,{" "}
        <code>debouncedStore</code> updates 500 ms after you stop.
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
        <strong>debouncedStore (500 ms):</strong>
      </p>
      <pre style={preStyle}>{JSON.stringify(debouncedStore, null, 2)}</pre>
    </div>
  );
});

/**
 * Multi-field form: each field is patched independently. The debounced store
 * mirrors the final state of all fields after 600 ms of inactivity.
 */
const MultiFieldDemo = component$(() => {
  const { store, debouncedStore } = useDebouncedStore(
    { first: "", last: "", email: "" },
    600,
  );

  return (
    <div style={boxStyle}>
      <p>
        Edit multiple fields — <code>debouncedStore</code> updates 600 ms after
        you pause.
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
        <strong>debouncedStore (600 ms):</strong>
      </p>
      <pre style={preStyle}>{JSON.stringify(debouncedStore, null, 2)}</pre>
    </div>
  );
});

/**
 * Counter: click rapidly — only the final count is committed to
 * `debouncedStore`. Shows that the timer resets on every call to `set`.
 */
const CounterDemo = component$(() => {
  const { store, debouncedStore } = useDebouncedStore({ count: 0 }, 400);

  return (
    <div style={boxStyle}>
      <p>Click +1 rapidly — only the last value is debounced.</p>
      <div style={rowStyle}>
        <button onClick$={() => store.count++}>+1</button>
        <button onClick$={() => (store.count = 0)}>Reset</button>
      </div>
      <p>
        <strong>store (immediate):</strong>
      </p>
      <pre style={preStyle}>{JSON.stringify(store, null, 2)}</pre>
      <p>
        <strong>debouncedStore (400 ms):</strong>
      </p>
      <pre style={preStyle}>{JSON.stringify(debouncedStore, null, 2)}</pre>
    </div>
  );
});

/**
 * Zero delay: when `delay` is 0, `debouncedStore` is updated
 * synchronously — both stores behave identically.
 */
const ZeroDelayDemo = component$(() => {
  const { store, debouncedStore } = useDebouncedStore({ query: "" }, 0);

  return (
    <div style={boxStyle}>
      <p>
        With <code>delay=0</code>, <code>debouncedStore</code> updates
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
        <strong>debouncedStore:</strong>
      </p>
      <pre style={preStyle}>{JSON.stringify(debouncedStore, null, 2)}</pre>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Hooks/useDebouncedStore",
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

export const ZeroDelay: Story = {
  render: () => <ZeroDelayDemo />,
};
