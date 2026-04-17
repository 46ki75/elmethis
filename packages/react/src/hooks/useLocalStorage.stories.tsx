import type { Meta, StoryObj } from "@storybook/react-vite";
import { useLocalStorage } from "./useLocalStorage";

const meta: Meta = {
  title: "Hooks/useLocalStorage",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

const BasicDemo = () => {
  const [value, setValue, remove] = useLocalStorage("storybook-basic", "hello");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "fit-content" }}>
      <div>Value: {value}</div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={remove}>Remove</button>
      <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
        localStorage key: <code>storybook-basic</code>
      </div>
    </div>
  );
};

const ObjectDemo = () => {
  const [value, setValue, remove] = useLocalStorage("storybook-object", { name: "Alice", age: 30 });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "fit-content" }}>
      <div>
        Name: {value.name}, Age: {value.age}
      </div>
      <input
        placeholder="name"
        value={value.name}
        onChange={(e) => setValue((prev) => ({ ...prev, name: e.target.value }))}
      />
      <input
        type="number"
        placeholder="age"
        value={value.age}
        onChange={(e) => setValue((prev) => ({ ...prev, age: Number(e.target.value) }))}
      />
      <button onClick={remove}>Remove</button>
      <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
        localStorage key: <code>storybook-object</code>
      </div>
    </div>
  );
};

const RawDemo = () => {
  const [value, setValue, remove] = useLocalStorage("storybook-raw", "raw-value", { raw: true });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "fit-content" }}>
      <div>Raw value: {value}</div>
      <input value={value} onChange={(e) => setValue(e.target.value)} />
      <button onClick={remove}>Remove</button>
      <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
        Stored as-is (no JSON serialization). localStorage key: <code>storybook-raw</code>
      </div>
    </div>
  );
};

const CustomSerializerDemo = () => {
  const [value, setValue, remove] = useLocalStorage<number[]>(
    "storybook-csv",
    [1, 2, 3],
    {
      serializer: (v) => v.join(","),
      deserializer: (s) => s.split(",").map(Number),
    },
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", width: "fit-content" }}>
      <div>Values: [{value.join(", ")}]</div>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button onClick={() => setValue((prev) => [...prev, prev.length + 1])}>Add</button>
        <button onClick={() => setValue((prev) => prev.slice(0, -1))}>Pop</button>
        <button onClick={remove}>Remove</button>
      </div>
      <div style={{ fontSize: "0.75rem", opacity: 0.6 }}>
        Stored as CSV string. localStorage key: <code>storybook-csv</code>
      </div>
    </div>
  );
};

export const Basic: Story = {
  render: () => <BasicDemo />,
};

export const ObjectValue: Story = {
  render: () => <ObjectDemo />,
};

export const Raw: Story = {
  render: () => <RawDemo />,
};

export const CustomSerializer: Story = {
  render: () => <CustomSerializerDemo />,
};
