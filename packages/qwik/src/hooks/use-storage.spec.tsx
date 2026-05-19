// @vitest-environment happy-dom

import { component$ } from "@qwik.dev/core";
import { createDOM } from "@qwik.dev/core/testing";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useLocalStorage, useSessionStorage } from "./use-storage";

// ---------------------------------------------------------------------------
// Wrapper components
// ---------------------------------------------------------------------------

const LocalWrapper = component$(() => {
  const { state } = useLocalStorage<string>({ key: "k", initialValue: "seed" });
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

// ---------------------------------------------------------------------------
// [CSR]
// ---------------------------------------------------------------------------

describe("[CSR] useLocalStorage", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("writes propagate to localStorage", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<LocalWrapper />);

    await userEvent("#set-a", "click");

    expect(screen.querySelector("#state")!.textContent).toBe("a");
    expect(localStorage.getItem("k")).toBe(JSON.stringify("a"));
  });

  // -------------------------------------------------------------------------
  // Regression pin: when storage was empty at mount, the writer
  // `useVisibleTask$` fires its initial run and persists `initialValue` to
  // storage — turning "no value stored" into "initialValue stored".
  //
  // This is the current (deliberate) behavior: a subscriber that calls
  // `useLocalStorage({ key: "k", initialValue: "seed" })` always sees its
  // key present in storage after mount, simplifying downstream consumers
  // that might want to enumerate keys. If we ever decide to gate the first
  // write on a user-initiated change instead, this test flags the shift.
  // -------------------------------------------------------------------------
  test("writer task persists initialValue when storage was empty at mount", async () => {
    expect(localStorage.getItem("k")).toBeNull();

    const { render } = await createDOM();
    await render(<LocalWrapper />);

    // Let both mount-time visible tasks (reader + writer) complete.
    await new Promise((r) => setTimeout(r, 0));

    expect(localStorage.getItem("k")).toBe(JSON.stringify("seed"));
  });
});

describe("[CSR] useSessionStorage BroadcastChannel reuse", () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  // -------------------------------------------------------------------------
  // Repro: the original `useSessionStorage` constructed a new
  // `BroadcastChannel` on every write (and again on `remove`). With
  // search-as-you-type writes, that means N constructor calls and N close()
  // calls per N writes — for no functional benefit, since one channel can
  // post any number of messages.
  //
  // We spy on the constructor and assert it is called at most once across
  // multiple writes after mount.
  // -------------------------------------------------------------------------
  test("constructs at most one BroadcastChannel across many writes", async () => {
    const ctorSpy = vi.spyOn(globalThis, "BroadcastChannel");
    const { render, userEvent } = await createDOM();
    await render(<SessionWrapper />);

    // Wait for the mount visible-task to allocate its (one) channel.
    await new Promise((r) => setTimeout(r, 0));

    const callsAfterMount = ctorSpy.mock.calls.length;

    // Multiple writes with distinct values — the buggy code would construct
    // one BC per write. (Writing the same value twice is a no-op in Qwik,
    // so we must use distinct values.)
    await userEvent("#set-a", "click");
    await userEvent("#set-b", "click");
    await userEvent("#set-c", "click");
    await new Promise((r) => setTimeout(r, 0));

    // No new BroadcastChannel constructions should have happened for the
    // writes — the mount-time channel is reused.
    expect(ctorSpy.mock.calls.length).toBe(callsAfterMount);
  });
});
