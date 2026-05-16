import { $, component$ } from "@qwik.dev/core";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useLocalStorage, type UseLocalStorageOptions } from "./useStorage";
import { useSessionStorage } from "./useStorage";

type UserProfile = { name: string; age: number };

type Props = UseLocalStorageOptions<UserProfile>;

const UseLocalStorageDemo = component$((props: Props) => {
  const { state, remove } = useLocalStorage(props);

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <p>
        <strong>key:</strong> {props.key}
      </p>
      <p>
        <strong>value:</strong> {JSON.stringify(state.value)}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <button onClick$={$(() => (state.value = { name: "Alice", age: 30 }))}>
          set Alice
        </button>
        <button onClick$={$(() => (state.value = { name: "Bob", age: 25 }))}>
          set Bob
        </button>
        <button onClick$={() => remove()}>remove</button>
      </div>
    </div>
  );
});

const UseSessionStorageDemo = component$((props: Props) => {
  const { state, remove } = useSessionStorage(props);

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <p>
        <strong>key:</strong> {props.key}
      </p>
      <p>
        <strong>value:</strong> {JSON.stringify(state.value)}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <button onClick$={$(() => (state.value = { name: "Alice", age: 30 }))}>
          set Alice
        </button>
        <button onClick$={$(() => (state.value = { name: "Bob", age: 25 }))}>
          set Bob
        </button>
        <button onClick$={() => remove()}>remove</button>
      </div>
    </div>
  );
});

const meta: Meta<Props> = {
  title: "Hooks/useStorage",
  component: UseLocalStorageDemo,
  tags: ["autodocs"],
  args: {
    key: "storybook-demo",
    initialValue: { name: "Guest", age: 0 },
  },
};

export default meta;
type Story = StoryObj<Props>;

export const LocalStorage: Story = {
  render(args) {
    return <UseLocalStorageDemo {...args} />;
  },
};

export const SessionStorage: Story = {
  render(args) {
    return <UseSessionStorageDemo {...args} />;
  },
};
