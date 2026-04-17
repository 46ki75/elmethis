import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLocalStorageDispatch } from "./useLocalStorageDispatch";

type Action =
  | { type: "INCREMENT" }
  | { type: "DECREMENT" }
  | { type: "RESET" };

type CounterState = { count: number };

const reducer = (state: CounterState, action: Action): CounterState => {
  switch (action.type) {
    case "INCREMENT":
      return { count: state.count + 1 };
    case "DECREMENT":
      return { count: state.count - 1 };
    case "RESET":
      return { count: 0 };
  }
};

const CounterButtons = ({
  state,
  dispatch,
  remove,
  storageKey,
}: {
  state: CounterState;
  dispatch: (action: Action) => void;
  remove: () => void;
  storageKey?: string;
}) => (
  <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "fit-content" }}>
    <div>Count: {state.count}</div>
    <div style={{ display: "flex", gap: "0.5rem" }}>
      <button onClick={() => dispatch({ type: "DECREMENT" })}>-</button>
      <button onClick={() => dispatch({ type: "INCREMENT" })}>+</button>
      <button onClick={() => dispatch({ type: "RESET" })}>Reset</button>
      <button onClick={remove}>Remove</button>
    </div>
    {storageKey && (
      <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
        localStorage key: <code>{storageKey}</code>
      </div>
    )}
  </div>
);

const InMemoryDemo = () => {
  const [state, dispatch, remove] = useLocalStorageDispatch(reducer, { count: 0 });
  return <CounterButtons state={state} dispatch={dispatch} remove={remove} />;
};

const WithLocalStorageDemo = ({ storageKey }: { storageKey: string }) => {
  const [state, dispatch, remove] = useLocalStorageDispatch(storageKey, reducer, { count: 0 });
  return <CounterButtons state={state} dispatch={dispatch} remove={remove} storageKey={storageKey} />;
};

const meta: Meta = {
  title: "Hooks/useLocalStorageDispatch",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const InMemory: Story = {
  render: () => <InMemoryDemo />,
};

export const WithLocalStorage: Story = {
  render: () => <WithLocalStorageDemo storageKey="storybook-counter" />,
};
