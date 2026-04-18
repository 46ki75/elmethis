import { component$ } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useLocalStorage, type UseLocalStorageOptions } from "./useStorage";
import { useSessionStorage } from "./useStorage";

type Props = UseLocalStorageOptions<string>;

const UseLocalStorageDemo = component$((props: Props) => {
  const { state, set, remove } = useLocalStorage(props);

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <p>
        <strong>key:</strong> {props.key}
      </p>
      <p>
        <strong>value:</strong> {String(state.value)}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <button onClick$={() => set("hello")}>set "hello"</button>
        <button onClick$={() => set("world")}>set "world"</button>
        <button onClick$={() => remove()}>remove</button>
      </div>
    </div>
  );
});

const UseSessionStorageDemo = component$((props: Props) => {
  const { state, set, remove } = useSessionStorage(props);

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <p>
        <strong>key:</strong> {props.key}
      </p>
      <p>
        <strong>value:</strong> {String(state.value)}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <button onClick$={() => set("hello")}>set "hello"</button>
        <button onClick$={() => set("world")}>set "world"</button>
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
    initialValue: "initial",
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
