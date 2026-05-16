import { component$, useSignal, type Signal } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useBindableSignal } from "./use-bindable-signal";

// ---------------------------------------------------------------------------
// Shared demo styles
// ---------------------------------------------------------------------------

const boxStyle = { fontFamily: "monospace", padding: "1rem" };
const rowStyle = { display: "flex", alignItems: "center", gap: "1rem" };

// ---------------------------------------------------------------------------
// Demo components
// ---------------------------------------------------------------------------

/**
 * Uncontrolled: no signal passed — the hook owns an internal one seeded
 * with `defaultValue`.
 */
const UncontrolledToggle = component$(() => {
  const isOpen = useBindableSignal<boolean>({ defaultValue: false });
  return (
    <div style={boxStyle}>
      <div style={rowStyle}>
        <button onClick$={() => (isOpen.value = !isOpen.value)}>
          {isOpen.value ? "Close" : "Open"}
        </button>
        <span>isOpen: {String(isOpen.value)}</span>
      </div>
    </div>
  );
});

/**
 * Controlled: parent passes their own signal. Writes from inside the toggle
 * land directly on `externalState`, and writes from outside (the "Reset"
 * button) are reflected in the toggle.
 */
const ToggleChild = component$(
  (props: { externalState: Signal<boolean> }) => {
    const isOpen = useBindableSignal({
      signal: props.externalState,
      defaultValue: false,
    });
    return (
      <button onClick$={() => (isOpen.value = !isOpen.value)}>
        {isOpen.value ? "Close" : "Open"}
      </button>
    );
  },
);

const ControlledToggle = component$(() => {
  const externalState = useSignal(false);
  return (
    <div style={boxStyle}>
      <div style={rowStyle}>
        <ToggleChild externalState={externalState} />
        <span>externalState: {String(externalState.value)}</span>
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
 * Two children bound to the same parent signal: edits from one are observed
 * by the other, with no glue code in the parent.
 */
const CounterChild = component$(
  (props: { external: Signal<number>; name: string }) => {
    const count = useBindableSignal({
      signal: props.external,
      defaultValue: 0,
    });
    return (
      <div style={rowStyle}>
        <span>{props.name}:</span>
        <button onClick$={() => (count.value -= 1)}>-1</button>
        <span>{count.value}</span>
        <button onClick$={() => (count.value += 1)}>+1</button>
      </div>
    );
  },
);

const SharedCounter = component$(() => {
  const shared = useSignal(0);
  return (
    <div style={boxStyle}>
      <CounterChild external={shared} name="A" />
      <CounterChild external={shared} name="B" />
      <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
        shared signal: {shared.value}
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Hooks/useBindableSignal",
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

export const SharedAcrossChildren: Story = {
  render: () => <SharedCounter />,
};
