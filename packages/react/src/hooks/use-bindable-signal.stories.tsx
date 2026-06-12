import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState, type CSSProperties } from "react";
import { useBindableSignal } from "./use-bindable-signal";

// ---------------------------------------------------------------------------
// Shared demo styles
// ---------------------------------------------------------------------------

const boxStyle: CSSProperties = { fontFamily: "monospace", padding: "1rem" };
const rowStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "1rem",
};

// ---------------------------------------------------------------------------
// Demo components
// ---------------------------------------------------------------------------

/**
 * Uncontrolled: no value passed — the hook owns internal state seeded with
 * `defaultValue`.
 */
const UncontrolledToggle = () => {
  const [isOpen, setIsOpen] = useBindableSignal<boolean>({
    defaultValue: false,
  });
  return (
    <div style={boxStyle}>
      <div style={rowStyle}>
        <button onClick={() => setIsOpen(!isOpen)}>
          {isOpen ? "Close" : "Open"}
        </button>
        <span>isOpen: {String(isOpen)}</span>
      </div>
    </div>
  );
};

/**
 * Controlled: parent passes their own value. Writes from inside the toggle are
 * routed through `onChange` to `externalState`, and writes from outside (the
 * "Reset" button) are reflected in the toggle.
 */
const ToggleChild = (props: {
  externalState: boolean;
  onExternalChange: (value: boolean) => void;
}) => {
  const [isOpen, setIsOpen] = useBindableSignal({
    value: props.externalState,
    defaultValue: false,
    onChange: props.onExternalChange,
  });
  return (
    <button onClick={() => setIsOpen(!isOpen)}>
      {isOpen ? "Close" : "Open"}
    </button>
  );
};

const ControlledToggle = () => {
  const [externalState, setExternalState] = useState(false);
  return (
    <div style={boxStyle}>
      <div style={rowStyle}>
        <ToggleChild
          externalState={externalState}
          onExternalChange={setExternalState}
        />
        <span>externalState: {String(externalState)}</span>
      </div>
      <div style={{ marginTop: "0.5rem" }}>
        <button onClick={() => setExternalState(false)}>
          Reset from outside
        </button>
      </div>
    </div>
  );
};

/**
 * Two children bound to the same parent state: edits from one are observed by
 * the other, with the parent owning the single source of truth.
 */
const CounterChild = (props: {
  external: number;
  onExternalChange: (value: number) => void;
  name: string;
}) => {
  const [count, setCount] = useBindableSignal({
    value: props.external,
    defaultValue: 0,
    onChange: props.onExternalChange,
  });
  return (
    <div style={rowStyle}>
      <span>{props.name}:</span>
      <button onClick={() => setCount(count - 1)}>-1</button>
      <span>{count}</span>
      <button onClick={() => setCount(count + 1)}>+1</button>
    </div>
  );
};

const SharedCounter = () => {
  const [shared, setShared] = useState(0);
  return (
    <div style={boxStyle}>
      <CounterChild external={shared} onExternalChange={setShared} name="A" />
      <CounterChild external={shared} onExternalChange={setShared} name="B" />
      <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
        shared state: {shared}
      </div>
    </div>
  );
};

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
