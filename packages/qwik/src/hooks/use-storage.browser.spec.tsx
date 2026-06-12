import { component$ } from "@qwik.dev/core";
import { render } from "vitest-browser-qwik";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useLocalStorage, useSessionStorage } from "./use-storage";

// These behaviors hinge on `useVisibleTask$({ strategy: "document-ready" })`
// firing and on a real `localStorage`/`BroadcastChannel`. createDOM/happy-dom
// fire `document-ready` unreliably under suite load (the task sometimes never
// runs), so this lives in the real-browser project where the lifecycle is
// faithful. See [[feedback_qwik_visible_task_strategy]].

const LocalWrapper = component$(() => {
  const { state } = useLocalStorage<string>({ key: "k", initialValue: "seed" });
  return (
    <div>
      <span id="state">{state.value}</span>
      <button id="set-a" onClick$={() => (state.value = "a")}>
        A
      </button>
    </div>
  );
});

const SessionWrapper = component$(() => {
  const { state } = useSessionStorage<string>({
    key: "sk",
    initialValue: "seed",
  });
  return (
    <div>
      <span id="state">{state.value}</span>
      <button id="set-a" onClick$={() => (state.value = "a")}>
        A
      </button>
      <button id="set-b" onClick$={() => (state.value = "b")}>
        B
      </button>
      <button id="set-c" onClick$={() => (state.value = "c")}>
        C
      </button>
    </div>
  );
});

describe("[CSR] useLocalStorage", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  test("writes propagate to localStorage", async () => {
    const screen = await render(<LocalWrapper />);

    await screen.getByRole("button", { name: "A", exact: true }).click();

    await vi.waitFor(() =>
      expect(localStorage.getItem("k")).toBe(JSON.stringify("a")),
    );
  });

  // Regression pin: when storage was empty at mount, the writer
  // `useVisibleTask$` fires its initial run and persists `initialValue` — so a
  // subscriber always sees its key present after mount.
  test("writer task persists initialValue when storage was empty at mount", async () => {
    expect(localStorage.getItem("k")).toBeNull();

    await render(<LocalWrapper />);

    await vi.waitFor(() =>
      expect(localStorage.getItem("k")).toBe(JSON.stringify("seed")),
    );
  });
});

describe("[CSR] useSessionStorage BroadcastChannel reuse", () => {
  beforeEach(() => sessionStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  // The channel is allocated once at mount and reused for every write — the
  // earlier code constructed a fresh BroadcastChannel per write/remove.
  test("constructs at most one BroadcastChannel across many writes", async () => {
    const ctorSpy = vi.spyOn(globalThis, "BroadcastChannel");
    const screen = await render(<SessionWrapper />);

    // Wait for the mount visible-task to allocate its (one) channel.
    await vi.waitFor(() =>
      expect(ctorSpy.mock.calls.length).toBeGreaterThanOrEqual(1),
    );
    const callsAfterMount = ctorSpy.mock.calls.length;

    // Distinct values — same-value writes are a no-op in Qwik.
    await screen.getByRole("button", { name: "A", exact: true }).click();
    await screen.getByRole("button", { name: "B", exact: true }).click();
    await screen.getByRole("button", { name: "C", exact: true }).click();
    await vi.waitFor(() =>
      expect(sessionStorage.getItem("sk")).toBe(JSON.stringify("c")),
    );

    // No new constructions for the writes — the mount-time channel is reused.
    expect(ctorSpy.mock.calls.length).toBe(callsAfterMount);
  });
});
