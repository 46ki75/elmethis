import type { CSSProperties } from "react";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { useBindableStore } from "./use-bindable-store";

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

interface FormState {
  name: string;
  age: number;
}

/**
 * Uncontrolled: no value passed — the hook owns internal state seeded with
 * `defaultValue`.
 */
const UncontrolledForm = () => {
  const [form, setForm] = useBindableStore<FormState>({
    defaultValue: { name: "Alice", age: 30 },
  });
  return (
    <div style={boxStyle}>
      <div style={rowStyle}>
        <label>
          name:{" "}
          <input
            value={form.name}
            onChange={(e) =>
              setForm((prev) => ({ ...prev, name: e.target.value }))
            }
          />
        </label>
        <button
          onClick={() => setForm((prev) => ({ ...prev, age: prev.age + 1 }))}
        >
          Age +1
        </button>
        <span>age: {form.age}</span>
      </div>
      <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
        snapshot: {JSON.stringify(form)}
      </div>
    </div>
  );
};

/**
 * Controlled: parent passes their own value. Writes from inside the form are
 * forwarded to `onChange`, and writes from outside (the "Reset" button) are
 * reflected in the form.
 */
const FormChild = (props: {
  externalForm: FormState;
  onChange: (value: FormState) => void;
}) => {
  const [form, setForm] = useBindableStore({
    value: props.externalForm,
    defaultValue: { name: "", age: 0 },
    onChange: props.onChange,
  });
  return (
    <div style={rowStyle}>
      <label>
        name:{" "}
        <input
          value={form.name}
          onChange={(e) =>
            setForm((prev) => ({ ...prev, name: e.target.value }))
          }
        />
      </label>
      <button
        onClick={() => setForm((prev) => ({ ...prev, age: prev.age + 1 }))}
      >
        Age +1
      </button>
    </div>
  );
};

const ControlledForm = () => {
  const [externalForm, setExternalForm] = useState<FormState>({
    name: "Alice",
    age: 30,
  });
  return (
    <div style={boxStyle}>
      <FormChild externalForm={externalForm} onChange={setExternalForm} />
      <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
        externalForm: {JSON.stringify(externalForm)}
      </div>
      <button
        style={{ marginTop: "0.5rem" }}
        onClick={() => setExternalForm({ name: "Alice", age: 30 })}
      >
        Reset from outside
      </button>
    </div>
  );
};

/**
 * Nested mutations: demonstrates that deeply-nested updates through the
 * returned setter are observable by every reader of the parent state.
 */
interface NestedState {
  user: { name: string; profile: { city: string } };
}

const NestedChild = (props: {
  external: NestedState;
  onChange: (value: NestedState) => void;
}) => {
  const [state, setState] = useBindableStore({
    value: props.external,
    defaultValue: { user: { name: "", profile: { city: "" } } },
    onChange: props.onChange,
  });
  return (
    <div style={rowStyle}>
      <label>
        name:{" "}
        <input
          value={state.user.name}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              user: { ...prev.user, name: e.target.value },
            }))
          }
        />
      </label>
      <label>
        city:{" "}
        <input
          value={state.user.profile.city}
          onChange={(e) =>
            setState((prev) => ({
              ...prev,
              user: {
                ...prev.user,
                profile: { ...prev.user.profile, city: e.target.value },
              },
            }))
          }
        />
      </label>
    </div>
  );
};

const NestedDemo = () => {
  const [external, setExternal] = useState<NestedState>({
    user: { name: "Alice", profile: { city: "Berlin" } },
  });
  return (
    <div style={boxStyle}>
      <NestedChild external={external} onChange={setExternal} />
      <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
        external: {JSON.stringify(external)}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta = {
  title: "Hooks/useBindableStore",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Uncontrolled: Story = {
  render: () => <UncontrolledForm />,
};

export const Controlled: Story = {
  render: () => <ControlledForm />,
};

export const NestedMutations: Story = {
  render: () => <NestedDemo />,
};
