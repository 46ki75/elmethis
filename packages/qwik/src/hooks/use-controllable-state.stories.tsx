import { $, component$, useComputed$, useSignal } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useControllableState } from "./use-controllable-state";

// ---------------------------------------------------------------------------
// Shared demo styles
// ---------------------------------------------------------------------------

const boxStyle = { fontFamily: "monospace", padding: "1rem" };
const rowStyle = { display: "flex", alignItems: "center", gap: "1rem" };

// ---------------------------------------------------------------------------
// Demo components
// ---------------------------------------------------------------------------

/**
 * Uncontrolled: the toggle manages its own open/closed state.
 * The consumer only provides a defaultProp; no external state is needed.
 */
const UncontrolledToggle = component$(() => {
  const [isOpen, setIsOpen] = useControllableState({
    prop: useComputed$(() => undefined as boolean | undefined),
    defaultProp: false,
  });

  return (
    <div style={boxStyle}>
      <div style={rowStyle}>
        <button onClick$={() => setIsOpen(!isOpen.value)}>
          {isOpen.value ? "Close" : "Open"}
        </button>
        <span>isOpen: {String(isOpen.value)}</span>
      </div>
    </div>
  );
});

/**
 * Controlled: parent owns the state and passes it down as a plain value.
 * The hook calls onChange$ and the parent decides whether to update.
 */
const ControlledToggle = component$(() => {
  const externalState = useSignal(false);

  const [isOpen, setIsOpen] = useControllableState({
    prop: useComputed$(() => externalState.value),
    defaultProp: false,
    onChange: $((v: boolean) => {
      externalState.value = v;
    }),
  });

  return (
    <div style={boxStyle}>
      <div style={rowStyle}>
        <button onClick$={() => setIsOpen(!isOpen.value)}>
          {isOpen.value ? "Close" : "Open"}
        </button>
        <span>isOpen: {String(isOpen.value)}</span>
      </div>
      <div style={{ marginTop: "0.5rem" }}>
        <button onClick$={() => (externalState.value = false)}>
          Reset from outside
        </button>
      </div>
    </div>
  );
});

/**
 * Read-only controlled: parent provides a value but ignores onChange$.
 * The toggle cannot change state — it's fully locked by the parent.
 */
const LockedToggle = component$(() => {
  const [isOpen, setIsOpen] = useControllableState({
    prop: useComputed$(() => true as boolean | undefined),
    defaultProp: false,
  });

  return (
    <div style={boxStyle}>
      <div style={rowStyle}>
        <button onClick$={() => setIsOpen(!isOpen.value)}>
          Toggle (locked — no onChange$)
        </button>
        <span>isOpen: {String(isOpen.value)}</span>
      </div>
    </div>
  );
});

/**
 * Functional updater: setter accepts (prev) => next, same as React's setState.
 */
const FunctionalUpdater = component$(() => {
  const [count, setCount] = useControllableState({
    prop: useComputed$(() => undefined as number | undefined),
    defaultProp: 0,
  });

  return (
    <div style={boxStyle}>
      <div style={rowStyle}>
        <button onClick$={() => setCount((n) => n + 1)}>+1</button>
        <button onClick$={() => setCount((n) => n - 1)}>-1</button>
        <button onClick$={() => setCount(0)}>Reset</button>
        <span>count: {count.value}</span>
      </div>
    </div>
  );
});

/**
 * Multiple controllable states in one component — mirrors the Dropdown pattern
 * from the lesson, with independent value and open state.
 */
const MultiStateDropdown = component$(() => {
  const externalValue = useSignal<string | undefined>(undefined);
  const externalOpen = useSignal<boolean | undefined>(undefined);

  const [value, setValue] = useControllableState({
    prop: useComputed$(() => externalValue.value),
    defaultProp: "",
    onChange: $((v: string) => {
      externalValue.value = v;
    }),
  });

  const [open, setOpen] = useControllableState({
    prop: useComputed$(() => externalOpen.value),
    defaultProp: false,
    onChange: $((v: boolean) => {
      externalOpen.value = v;
    }),
  });

  const options = ["apple", "banana", "cherry"];

  return (
    <div style={boxStyle}>
      <div style={rowStyle}>
        <button onClick$={() => setOpen(!open.value)}>
          {open.value ? "▲" : "▼"} {value.value || "Select a fruit"}
        </button>
      </div>
      {open.value && (
        <ul style={{ margin: "0.25rem 0", paddingLeft: "1rem" }}>
          {options.map((opt) => (
            <li key={opt}>
              <button
                onClick$={() => {
                  setValue(opt);
                  setOpen(false);
                }}
              >
                {opt}
              </button>
            </li>
          ))}
        </ul>
      )}
      <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
        <div>value: {JSON.stringify(value.value)}</div>
        <div>open: {String(open.value)}</div>
      </div>
      <button
        style={{ marginTop: "0.5rem" }}
        onClick$={() => {
          externalValue.value = undefined;
          externalOpen.value = undefined;
        }}
      >
        Reset all (uncontrolled)
      </button>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Hooks/useControllableState",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Uncontrolled: Story = {
  render: () => <UncontrolledToggle />,
};

export const Controlled: Story = {
  render: () => <ControlledToggle />,
};

export const Locked: Story = {
  render: () => <LockedToggle />,
};

export const FunctionalUpdaterPattern: Story = {
  render: () => <FunctionalUpdater />,
};

export const MultipleStates: Story = {
  render: () => <MultiStateDropdown />,
};
