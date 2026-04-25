import { $, component$ } from "@builder.io/qwik";
import type { Meta, StoryObj } from "storybook-framework-qwik";
import { useAsyncState } from "./use-async-state";

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------

interface User {
  id: number;
  name: string;
  email: string;
}

const INITIAL_USER: User = { id: 0, name: "", email: "" };

const mockFetchUser = async (): Promise<User> => {
  await new Promise<void>((resolve) => setTimeout(resolve, 1000));
  return { id: 1, name: "Alice", email: "alice@example.com" };
};

const mockFetchError = async (): Promise<User> => {
  await new Promise<void>((resolve) => setTimeout(resolve, 800));
  throw new Error("Network error: failed to fetch user");
};

// ---------------------------------------------------------------------------
// Demo components
// ---------------------------------------------------------------------------

const UseAsyncStateBasic = component$(() => {
  const { state, isReady, isLoading, error, execute } = useAsyncState(
    $(mockFetchUser),
    INITIAL_USER,
  );

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <p>
        <strong>isLoading:</strong> {String(isLoading.value)}
      </p>
      <p>
        <strong>isReady:</strong> {String(isReady.value)}
      </p>
      {!!error.value && (
        <p style={{ color: "red" }}>
          <strong>error:</strong> {String(error.value)}
        </p>
      )}
      <pre style={{ background: "#f4f4f4", padding: "0.5rem" }}>
        {JSON.stringify(state.value, null, 2)}
      </pre>
      <button onClick$={() => execute()}>Refresh</button>
    </div>
  );
});

const UseAsyncStateManual = component$(() => {
  const { state, isReady, isLoading, execute } = useAsyncState(
    $(mockFetchUser),
    INITIAL_USER,
    { immediate: false },
  );

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <p>
        <strong>isLoading:</strong> {String(isLoading.value)}
      </p>
      <p>
        <strong>isReady:</strong> {String(isReady.value)}
      </p>
      <pre style={{ background: "#f4f4f4", padding: "0.5rem" }}>
        {JSON.stringify(state.value, null, 2)}
      </pre>
      <button onClick$={() => execute()}>Load data</button>
    </div>
  );
});

const UseAsyncStateWithError = component$(() => {
  const { state, isReady, isLoading, error, execute } = useAsyncState(
    $(mockFetchError),
    INITIAL_USER,
  );

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <p>
        <strong>isLoading:</strong> {String(isLoading.value)}
      </p>
      <p>
        <strong>isReady:</strong> {String(isReady.value)}
      </p>
      {!!error.value && (
        <p style={{ color: "red" }}>
          <strong>error:</strong> {String(error.value)}
        </p>
      )}
      <pre style={{ background: "#f4f4f4", padding: "0.5rem" }}>
        {JSON.stringify(state.value, null, 2)}
      </pre>
      <button onClick$={() => execute()}>Retry</button>
    </div>
  );
});

const UseAsyncStateWithDelay = component$(() => {
  const { state, isReady, isLoading, execute } = useAsyncState(
    $(mockFetchUser),
    INITIAL_USER,
    { delay: 2000 },
  );

  return (
    <div style={{ fontFamily: "monospace", padding: "1rem" }}>
      <p>Initial load is delayed by 2 seconds.</p>
      <p>
        <strong>isLoading:</strong> {String(isLoading.value)}
      </p>
      <p>
        <strong>isReady:</strong> {String(isReady.value)}
      </p>
      <pre style={{ background: "#f4f4f4", padding: "0.5rem" }}>
        {JSON.stringify(state.value, null, 2)}
      </pre>
      <button onClick$={() => execute()}>Refresh (no delay)</button>
    </div>
  );
});

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

const meta: Meta = {
  title: "Hooks/useAsyncState",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj;

export const Basic: Story = {
  render: () => <UseAsyncStateBasic />,
};

export const Manual: Story = {
  render: () => <UseAsyncStateManual />,
};

export const WithError: Story = {
  render: () => <UseAsyncStateWithError />,
};

export const WithDelay: Story = {
  render: () => <UseAsyncStateWithDelay />,
};
