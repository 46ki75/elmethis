import { render } from "vitest-browser-react";
import { page } from "vitest/browser";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useLocalStorage, useSessionStorage } from "./use-storage";

// These behaviors hinge on the client-only mount effects firing and on a real
// `localStorage` / `BroadcastChannel`, so this lives in the real-browser
// project where the lifecycle is faithful.

const LocalWrapper = () => {
  const { state, setState } = useLocalStorage<string>({
    key: "k",
    initialValue: "seed",
  });
  return (
    <div>
      <span id="state">{state}</span>
      <button id="set-a" onClick={() => setState("a")}>
        A
      </button>
    </div>
  );
};

const SessionWrapper = () => {
  const { state, setState } = useSessionStorage<string>({
    key: "sk",
    initialValue: "seed",
  });
  return (
    <div>
      <span id="state">{state}</span>
      <button id="set-a" onClick={() => setState("a")}>
        A
      </button>
      <button id="set-b" onClick={() => setState("b")}>
        B
      </button>
      <button id="set-c" onClick={() => setState("c")}>
        C
      </button>
    </div>
  );
};

describe("[CSR] useLocalStorage", () => {
  beforeEach(() => localStorage.clear());
  afterEach(() => vi.restoreAllMocks());

  test("writes propagate to localStorage", async () => {
    render(<LocalWrapper />);

    await page.getByRole("button", { name: "A", exact: true }).click();

    await vi.waitFor(() =>
      expect(localStorage.getItem("k")).toBe(JSON.stringify("a")),
    );
  });

  // Regression pin: when storage was empty at mount, the writer effect fires
  // its initial run and persists `initialValue` — so a subscriber always sees
  // its key present after mount.
  test("writer effect persists initialValue when storage was empty at mount", async () => {
    expect(localStorage.getItem("k")).toBeNull();

    render(<LocalWrapper />);

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
    // Count constructions while keeping a REAL channel. `vi.spyOn` is no good
    // here: when the hook does `new BroadcastChannel(...)`, vitest invokes the
    // mock via `Reflect.construct`, which can neither call-through to a native
    // class nor accept an arrow-function implementation — either way the hook
    // gets a non-functional instance (its `postMessage`/`close` are undefined),
    // producing write warnings and an unhandled rejection on unmount. A counting
    // subclass that simply forwards to `super` stays fully functional.
    const OriginalBroadcastChannel = globalThis.BroadcastChannel;
    let constructions = 0;
    class CountingBroadcastChannel extends OriginalBroadcastChannel {
      constructor(name: string) {
        super(name);
        constructions++;
      }
    }
    globalThis.BroadcastChannel =
      CountingBroadcastChannel as typeof BroadcastChannel;

    try {
      render(<SessionWrapper />);

      // Wait for the mount effect to allocate its (one) channel.
      await vi.waitFor(() => expect(constructions).toBeGreaterThanOrEqual(1));
      const countAfterMount = constructions;

      await page.getByRole("button", { name: "A", exact: true }).click();
      await page.getByRole("button", { name: "B", exact: true }).click();
      await page.getByRole("button", { name: "C", exact: true }).click();
      await vi.waitFor(() =>
        expect(sessionStorage.getItem("sk")).toBe(JSON.stringify("c")),
      );

      // No new constructions for the writes — the mount-time channel is reused.
      expect(constructions).toBe(countAfterMount);
    } finally {
      globalThis.BroadcastChannel = OriginalBroadcastChannel;
    }
  });
});
