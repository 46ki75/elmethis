import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { useDebouncedStore } from "./use-debounced-store";

// ---------------------------------------------------------------------------
// Wrapper components used by tests
// ---------------------------------------------------------------------------

const InitialWrapper = () => {
  const { store, debouncedStore } = useDebouncedStore(
    { name: "Alice", age: 30 },
    300,
  );
  return (
    <div>
      <span id="store-name">{store.name}</span>
      <span id="store-age">{store.age}</span>
      <span id="debounced-name">{debouncedStore.name}</span>
      <span id="debounced-age">{debouncedStore.age}</span>
    </div>
  );
};

const SetterWrapper = () => {
  const { store, setStore, debouncedStore } = useDebouncedStore(
    { query: "" },
    50,
  );
  return (
    <div>
      <span id="store-query">{store.query}</span>
      <span id="debounced-query">{debouncedStore.query}</span>
      <button id="btn-a" onClick={() => setStore({ query: "a" })}>
        Set A
      </button>
      <button id="btn-b" onClick={() => setStore({ query: "b" })}>
        Set B
      </button>
    </div>
  );
};

const ZeroDelayWrapper = () => {
  const { store, setStore, debouncedStore } = useDebouncedStore(
    { query: "" },
    0,
  );
  return (
    <div>
      <span id="store-query">{store.query}</span>
      <span id="debounced-query">{debouncedStore.query}</span>
      <button id="btn" onClick={() => setStore({ query: "immediate" })}>
        Set
      </button>
    </div>
  );
};

const NestedWrapper = () => {
  const { store, setStore, debouncedStore } = useDebouncedStore<{
    user: { name: string };
  }>({ user: { name: "Alice" } }, 50);
  return (
    <div>
      <span id="store-name">{store.user.name}</span>
      <span id="debounced-name">{debouncedStore.user.name}</span>
      <button id="btn" onClick={() => setStore({ user: { name: "Bob" } })}>
        Set
      </button>
    </div>
  );
};

// Module-level so the test body can mutate it AFTER mount and observe
// whether the hook's internal stores still hold an isolated deep copy.
const sharedInitial: { user: { name: string }; marker: number } = {
  user: { name: "Alice" },
  marker: 0,
};

const SharedInitialWrapper = () => {
  const { store, setStore, debouncedStore } = useDebouncedStore(
    sharedInitial,
    50,
  );
  return (
    <div>
      <span id="store-name">{store.user.name}</span>
      <span id="debounced-name">{debouncedStore.user.name}</span>
      <span id="store-marker">{store.marker}</span>
      <button
        id="bump"
        onClick={() => setStore((s) => ({ ...s, marker: s.marker + 1 }))}
      >
        Bump
      </button>
    </div>
  );
};

const MultiKeyWrapper = () => {
  const { store, setStore, debouncedStore } = useDebouncedStore(
    { first: "", last: "" },
    50,
  );
  return (
    <div>
      <span id="store-first">{store.first}</span>
      <span id="store-last">{store.last}</span>
      <span id="debounced-first">{debouncedStore.first}</span>
      <span id="debounced-last">{debouncedStore.last}</span>
      <button
        id="btn-patch"
        onClick={() => setStore((s) => ({ ...s, first: "Bob" }))}
      >
        Patch first
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------

describe("[SSR]", () => {
  test("renders initial values", () => {
    const html = renderToStaticMarkup(<InitialWrapper />);
    expect(html).toContain("Alice");
    expect(html).toContain("30");
  });
});

// ---------------------------------------------------------------------------
// [CSR]
// ---------------------------------------------------------------------------

describe("[CSR]", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  test("renders initial values", () => {
    const { container } = render(<InitialWrapper />);
    expect(container.querySelector("#store-name")!.textContent).toBe("Alice");
    expect(container.querySelector("#store-age")!.textContent).toBe("30");
    expect(container.querySelector("#debounced-name")!.textContent).toBe(
      "Alice",
    );
    expect(container.querySelector("#debounced-age")!.textContent).toBe("30");
  });

  test("with delay=0, both stores update synchronously", () => {
    const { container } = render(<ZeroDelayWrapper />);

    fireEvent.click(container.querySelector("#btn")!);

    expect(container.querySelector("#store-query")!.textContent).toBe(
      "immediate",
    );
    expect(container.querySelector("#debounced-query")!.textContent).toBe(
      "immediate",
    );
  });

  test("store updates immediately on set", () => {
    const { container } = render(<SetterWrapper />);

    fireEvent.click(container.querySelector("#btn-a")!);

    expect(container.querySelector("#store-query")!.textContent).toBe("a");
  });

  test("debouncedStore does not update before delay elapses", () => {
    vi.useFakeTimers();
    const { container } = render(<SetterWrapper />);

    fireEvent.click(container.querySelector("#btn-a")!);

    expect(container.querySelector("#store-query")!.textContent).toBe("a");
    // Timer has not fired yet — debouncedStore remains at its initial value.
    expect(container.querySelector("#debounced-query")!.textContent).toBe("");
  });

  test("rapid successive calls reset the timer each time", () => {
    vi.useFakeTimers();
    const { container } = render(<SetterWrapper />);

    // Both buttons are clicked before the debounce delay elapses.
    fireEvent.click(container.querySelector("#btn-a")!);
    fireEvent.click(container.querySelector("#btn-b")!);

    // store is up-to-date with the last write
    expect(container.querySelector("#store-query")!.textContent).toBe("b");
    // debouncedStore has not fired yet
    expect(container.querySelector("#debounced-query")!.textContent).toBe("");
  });

  test("partial patch does not affect unpatched keys in store", () => {
    const { container } = render(<MultiKeyWrapper />);

    fireEvent.click(container.querySelector("#btn-patch")!);

    // store.first is updated; store.last remains empty
    expect(container.querySelector("#store-first")!.textContent).toBe("Bob");
    expect(container.querySelector("#store-last")!.textContent).toBe("");
  });

  test("writes across multiple keys are all debounced together", () => {
    // Mirrors the MultiField storybook: three independent keys are patched
    // in rapid succession; `debouncedStore` should remain at its initial
    // empty state until the delay elapses, then flush all three at once.
    const MultiFieldWrapper = () => {
      const { store, setStore, debouncedStore } = useDebouncedStore(
        { first: "", last: "", email: "" },
        100,
      );
      return (
        <div>
          <span id="store-json">{JSON.stringify(store)}</span>
          <span id="debounced-json">{JSON.stringify(debouncedStore)}</span>
          <button
            id="btn-first"
            onClick={() => setStore((s) => ({ ...s, first: "Ada" }))}
          >
            Set first
          </button>
          <button
            id="btn-last"
            onClick={() => setStore((s) => ({ ...s, last: "Lovelace" }))}
          >
            Set last
          </button>
          <button
            id="btn-email"
            onClick={() => setStore((s) => ({ ...s, email: "a@b.c" }))}
          >
            Set email
          </button>
        </div>
      );
    };

    vi.useFakeTimers();
    const { container } = render(<MultiFieldWrapper />);

    fireEvent.click(container.querySelector("#btn-first")!);
    fireEvent.click(container.querySelector("#btn-last")!);
    fireEvent.click(container.querySelector("#btn-email")!);

    // store updates immediately on each click.
    expect(container.querySelector("#store-json")!.textContent).toBe(
      JSON.stringify({ first: "Ada", last: "Lovelace", email: "a@b.c" }),
    );
    // Before the 100 ms delay elapses, debouncedStore is still empty.
    expect(container.querySelector("#debounced-json")!.textContent).toBe(
      JSON.stringify({ first: "", last: "", email: "" }),
    );

    act(() => {
      vi.advanceTimersByTime(150);
    });

    // After the delay, all three keys are flushed together.
    expect(container.querySelector("#debounced-json")!.textContent).toBe(
      JSON.stringify({ first: "Ada", last: "Lovelace", email: "a@b.c" }),
    );
  });

  test("nested writes are debounced and do not leak into debouncedStore early", () => {
    // The React port deep-clones each write into the debounced copy, so a
    // nested mutation never shares a reference with `debouncedStore`.
    vi.useFakeTimers();
    const { container } = render(<NestedWrapper />);

    fireEvent.click(container.querySelector("#btn")!);

    // store reflects the write immediately — expected.
    expect(container.querySelector("#store-name")!.textContent).toBe("Bob");
    // debouncedStore should still hold the initial value because the
    // 50 ms timer has not fired (fake timers, no advancement).
    expect(container.querySelector("#debounced-name")!.textContent).toBe(
      "Alice",
    );

    act(() => {
      vi.advanceTimersByTime(100);
    });

    // After the delay, the nested write flushes through.
    expect(container.querySelector("#debounced-name")!.textContent).toBe("Bob");
  });

  // -------------------------------------------------------------------------
  // Regression pin: the hook deep-clones `initialValue` for BOTH stores.
  //
  // Without that clone, the internal state would share the caller's object
  // reference. The caller could then mutate `initialValue` after mount and —
  // on the next re-render — see their mutation leak into `store` /
  // `debouncedStore`.
  //
  // This test mutates `sharedInitial` after mount, then triggers a re-render
  // via the returned setter. With the current `cloneDeep(initialValue)` seed,
  // the re-render still shows the original "Alice".
  // -------------------------------------------------------------------------
  test("mutating the caller's initialValue after mount does not bleed into either store", () => {
    // Reset shared state so the test is independent of run order.
    sharedInitial.user.name = "Alice";
    sharedInitial.marker = 0;

    const { container } = render(<SharedInitialWrapper />);

    expect(container.querySelector("#store-name")!.textContent).toBe("Alice");
    expect(container.querySelector("#debounced-name")!.textContent).toBe(
      "Alice",
    );

    // The caller mutates the original object directly.
    sharedInitial.user.name = "Mutated";

    // Trigger a re-render through the returned setter. Both spans re-read
    // their bindings; the internal deep clones still hold "Alice".
    fireEvent.click(container.querySelector("#bump")!);

    expect(container.querySelector("#store-name")!.textContent).toBe("Alice");
    expect(container.querySelector("#debounced-name")!.textContent).toBe(
      "Alice",
    );
  });
});
