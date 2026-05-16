import { component$, useStore } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useControllableStore } from "./use-controllable-store";

// ---------------------------------------------------------------------------
// Shared demo styles
// ---------------------------------------------------------------------------

const boxStyle = { fontFamily: "monospace", padding: "1rem" };
const rowStyle = { display: "flex", alignItems: "center", gap: "1rem" };

// ---------------------------------------------------------------------------
// Demo components
// ---------------------------------------------------------------------------

interface FormState {
  name: string;
  age: number;
}

/**
 * Uncontrolled: no store passed — the hook owns an internal one seeded with
 * `defaultValue`.
 */
const UncontrolledForm = component$(() => {
  const form = useControllableStore<FormState>({
    defaultValue: { name: "Alice", age: 30 },
  });
  return (
    <div style={boxStyle}>
      <div style={rowStyle}>
        <label>
          name:{" "}
          <input
            value={form.name}
            onInput$={(_, el) => (form.name = (el as HTMLInputElement).value)}
          />
        </label>
        <button onClick$={() => (form.age += 1)}>Age +1</button>
        <span>age: {form.age}</span>
      </div>
      <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
        snapshot: {JSON.stringify(form)}
      </div>
    </div>
  );
});

/**
 * Controlled: parent passes their own store. Writes from inside the form
 * land directly on `externalForm`, and writes from outside (the "Reset"
 * button) are reflected in the form.
 */
const FormChild = component$((props: { externalForm: FormState }) => {
  const form = useControllableStore({
    store: props.externalForm,
    defaultValue: { name: "", age: 0 },
  });
  return (
    <div style={rowStyle}>
      <label>
        name:{" "}
        <input
          value={form.name}
          onInput$={(_, el) => (form.name = (el as HTMLInputElement).value)}
        />
      </label>
      <button onClick$={() => (form.age += 1)}>Age +1</button>
    </div>
  );
});

const ControlledForm = component$(() => {
  const externalForm = useStore<FormState>({ name: "Alice", age: 30 });
  return (
    <div style={boxStyle}>
      <FormChild externalForm={externalForm} />
      <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
        externalForm: {JSON.stringify(externalForm)}
      </div>
      <button
        style={{ marginTop: "0.5rem" }}
        onClick$={() => {
          externalForm.name = "Alice";
          externalForm.age = 30;
        }}
      >
        Reset from outside
      </button>
    </div>
  );
});

/**
 * Nested mutations: demonstrates that deeply-nested writes through the
 * returned proxy are observable by every reader of the parent store.
 */
interface NestedState {
  user: { name: string; profile: { city: string } };
}

const NestedChild = component$((props: { external: NestedState }) => {
  const state = useControllableStore({
    store: props.external,
    defaultValue: { user: { name: "", profile: { city: "" } } },
  });
  return (
    <div style={rowStyle}>
      <label>
        name:{" "}
        <input
          value={state.user.name}
          onInput$={(_, el) =>
            (state.user.name = (el as HTMLInputElement).value)
          }
        />
      </label>
      <label>
        city:{" "}
        <input
          value={state.user.profile.city}
          onInput$={(_, el) =>
            (state.user.profile.city = (el as HTMLInputElement).value)
          }
        />
      </label>
    </div>
  );
});

const NestedDemo = component$(() => {
  const external = useStore<NestedState>({
    user: { name: "Alice", profile: { city: "Berlin" } },
  });
  return (
    <div style={boxStyle}>
      <NestedChild external={external} />
      <div style={{ marginTop: "0.5rem", fontSize: "0.8rem" }}>
        external: {JSON.stringify(external)}
      </div>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Hooks/useControllableStore",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Uncontrolled: Story = {
  render: () => <UncontrolledForm />,
};

export const Controlled: Story = {
  render: () => <ControlledForm />,
};

export const NestedMutations: Story = {
  render: () => <NestedDemo />,
};
