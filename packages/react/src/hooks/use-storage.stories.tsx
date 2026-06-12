import type { Meta, StoryObj } from "@storybook/react-vite";
import {
  useLocalStorage,
  useSessionStorage,
  type UseLocalStorageOptions,
} from "./use-storage";

type UserProfile = { name: string; age: number };

type Props = UseLocalStorageOptions<UserProfile>;

const UseLocalStorageDemo = (props: Props) => {
  const { state, setState, remove } = useLocalStorage(props);

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <p>
        <strong>key:</strong> {props.key}
      </p>
      <p>
        <strong>value:</strong> {JSON.stringify(state)}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <button onClick={() => setState({ name: "Alice", age: 30 })}>
          set Alice
        </button>
        <button onClick={() => setState({ name: "Bob", age: 25 })}>
          set Bob
        </button>
        <button onClick={() => remove()}>remove</button>
      </div>
    </div>
  );
};

const UseSessionStorageDemo = (props: Props) => {
  const { state, setState, remove } = useSessionStorage(props);

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <p>
        <strong>key:</strong> {props.key}
      </p>
      <p>
        <strong>value:</strong> {JSON.stringify(state)}
      </p>
      <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
        <button onClick={() => setState({ name: "Alice", age: 30 })}>
          set Alice
        </button>
        <button onClick={() => setState({ name: "Bob", age: 25 })}>
          set Bob
        </button>
        <button onClick={() => remove()}>remove</button>
      </div>
    </div>
  );
};

const meta = {
  title: "Hooks/useStorage",
  component: UseLocalStorageDemo,
  tags: ["autodocs"],
  args: {
    key: "storybook-demo",
    initialValue: { name: "Guest", age: 0 },
  },
} satisfies Meta<typeof UseLocalStorageDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LocalStorage: Story = {
  render: (args) => <UseLocalStorageDemo {...args} />,
};

export const SessionStorage: Story = {
  render: (args) => <UseSessionStorageDemo {...args} />,
};
