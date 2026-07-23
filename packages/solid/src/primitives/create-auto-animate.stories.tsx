import { createSignal, For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import {
  createAutoAnimate,
  type CreateAutoAnimateOptions,
} from "./create-auto-animate";

const meta = {
  title: "Hooks/createAutoAnimate",
  tags: ["autodocs"],
  args: {
    config: { duration: 300 },
    enabled: true,
  },
} satisfies Meta<CreateAutoAnimateOptions>;

export default meta;
type Story = StoryObj<typeof meta>;

const ListStory = (props: CreateAutoAnimateOptions) => {
  const { ref, enabled, setEnabled, controller } =
    createAutoAnimate<HTMLUListElement>(props);
  const [items, setItems] = createSignal([1, 2, 3, 4, 5]);

  return (
    <div style={{ "max-width": "28rem" }}>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          "align-items": "center",
          "margin-bottom": "1rem",
        }}
      >
        <button
          onClick={() =>
            setItems((current) => [...current].sort(() => Math.random() - 0.5))
          }
        >
          Shuffle
        </button>
        <button
          onClick={() =>
            setItems((current) => [...current, Math.max(0, ...current) + 1])
          }
        >
          Add
        </button>
        <button onClick={() => setItems((current) => current.slice(0, -1))}>
          Remove
        </button>
        <button onClick={() => setEnabled((current) => !current)}>
          {enabled() ? "Disable" : "Enable"}
        </button>
        <output>
          Controller:{" "}
          {enabled() && controller()?.isEnabled() ? "enabled" : "disabled"}
        </output>
      </div>
      <ul
        ref={ref}
        style={{
          display: "grid",
          "align-content": "start",
          gap: "0.5rem",
          margin: "0",
          padding: "0",
          "list-style": "none",
        }}
      >
        <For each={items()}>
          {(item) => (
            <li
              style={{
                padding: "0.75rem 1rem",
                border:
                  "1px solid color-mix(in srgb, currentColor 20%, transparent)",
                "border-radius": "0.375rem",
              }}
            >
              Item {item}
            </li>
          )}
        </For>
      </ul>
    </div>
  );
};

export const List: Story = {
  render: (args) => <ListStory {...args} />,
};
