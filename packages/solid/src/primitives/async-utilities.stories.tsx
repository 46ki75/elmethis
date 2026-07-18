import { createSignal, For } from "solid-js";
import type { Meta, StoryObj } from "storybook-solidjs-vite";

import { createAsyncState } from "./create-async-state";
import { createThrottledQueue } from "./create-throttled-queue";

const panelStyle = {
  "font-family": "monospace",
  display: "grid",
  gap: "0.75rem",
  "max-width": "40rem",
  padding: "1rem",
};

const AsyncStateDemo = () => {
  let request = 0;
  const user = createAsyncState(
    async () => {
      const currentRequest = ++request;
      await new Promise<void>((resolve) => setTimeout(resolve, 800));
      return `Result from request ${currentRequest}`;
    },
    "No result yet",
    { immediate: false },
  );

  return (
    <section style={panelStyle}>
      <p>
        Start several requests. Only the latest execution may commit to state.
      </p>
      <button
        type="button"
        disabled={user.isLoading()}
        onClick={() => void user.execute()}
      >
        {user.isLoading() ? "Loading..." : "Load"}
      </button>
      <output>{user.state()}</output>
      <span>Ready: {String(user.isReady())}</span>
    </section>
  );
};

const QueueDemo = () => {
  const queue = createThrottledQueue(500);
  const [events, setEvents] = createSignal<string[]>([]);
  let task = 0;

  const enqueue = () => {
    const id = ++task;
    setEvents((current) => [...current, `Task ${id} queued`]);
    void queue.push(async () => {
      setEvents((current) => [...current, `Task ${id} started`]);
      await new Promise<void>((resolve) => setTimeout(resolve, 250));
      setEvents((current) => [...current, `Task ${id} finished`]);
    });
  };

  return (
    <section style={panelStyle}>
      <p>Queue tasks rapidly. They run FIFO with 500 ms between completions.</p>
      <button type="button" onClick={enqueue}>
        Queue task
      </button>
      <ol>
        <For each={events()}>{(event) => <li>{event}</li>}</For>
      </ol>
    </section>
  );
};

const meta = {
  title: "Primitives/Async Utilities",
  tags: ["autodocs"],
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const LatestAsyncExecutionWins: Story = {
  render: () => <AsyncStateDemo />,
};
export const OwnerScopedQueue: Story = { render: () => <QueueDemo /> };
