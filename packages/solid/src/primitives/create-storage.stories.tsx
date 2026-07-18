import type { Meta, StoryObj } from "storybook-solidjs-vite";

import {
  createLocalStorage,
  createSessionStorage,
  type StorageController,
} from "./create-storage";

type Profile = { name: string; visits: number } | null;

const StoragePanel = (props: {
  label: string;
  controller: StorageController<Profile>;
}) => (
  <section style={{ display: "grid", gap: "0.5rem" }}>
    <strong>{props.label}</strong>
    <code>{JSON.stringify(props.controller.state())}</code>
    <div style={{ display: "flex", gap: "0.5rem", "flex-wrap": "wrap" }}>
      <button
        type="button"
        onClick={() =>
          props.controller.setState((previous) => ({
            name: "Ada",
            visits: (previous?.visits ?? 0) + 1,
          }))
        }
      >
        Visit as Ada
      </button>
      <button type="button" onClick={() => props.controller.setState(null)}>
        Store null
      </button>
      <button type="button" onClick={() => props.controller.remove()}>
        Remove
      </button>
    </div>
  </section>
);

const StorageDemo = () => {
  const local = createLocalStorage<Profile>({
    key: "elmethis-story-local",
    initialValue: { name: "Guest", visits: 0 },
  });
  const session = createSessionStorage<Profile>({
    key: "elmethis-story-session",
    initialValue: { name: "Guest", visits: 0 },
  });

  return (
    <div style={{ display: "grid", gap: "1.5rem", "max-width": "32rem" }}>
      <StoragePanel label="localStorage" controller={local} />
      <StoragePanel label="sessionStorage" controller={session} />
    </div>
  );
};

const meta = {
  title: "Primitives/createStorage",
  component: StorageDemo,
  tags: ["autodocs"],
} satisfies Meta<typeof StorageDemo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const LocalAndSession: Story = {};
