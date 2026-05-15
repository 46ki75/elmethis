import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { createDOM } from "@builder.io/qwik/testing";
import { renderToString } from "@builder.io/qwik/server";
import { component$ } from "@builder.io/qwik";

import { useDebouncedStore } from "./use-debounced-store";

// ---------------------------------------------------------------------------
// Wrapper components used by tests
// ---------------------------------------------------------------------------

const InitialWrapper = component$(() => {
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
});

const SetterWrapper = component$(() => {
  const { store, debouncedStore } = useDebouncedStore({ query: "" }, 50);
  return (
    <div>
      <span id="store-query">{store.query}</span>
      <span id="debounced-query">{debouncedStore.query}</span>
      <button id="btn-a" onClick$={() => (store.query = "a")}>
        Set A
      </button>
      <button id="btn-b" onClick$={() => (store.query = "b")}>
        Set B
      </button>
    </div>
  );
});

const ZeroDelayWrapper = component$(() => {
  const { store, debouncedStore } = useDebouncedStore({ query: "" }, 0);
  return (
    <div>
      <span id="store-query">{store.query}</span>
      <span id="debounced-query">{debouncedStore.query}</span>
      <button id="btn" onClick$={() => (store.query = "immediate")}>
        Set
      </button>
    </div>
  );
});

const NestedWrapper = component$(() => {
  const { store, debouncedStore } = useDebouncedStore<{
    user: { name: string };
  }>({ user: { name: "Alice" } }, 50);
  return (
    <div>
      <span id="store-name">{store.user.name}</span>
      <span id="debounced-name">{debouncedStore.user.name}</span>
      <button id="btn" onClick$={() => (store.user.name = "Bob")}>
        Set
      </button>
    </div>
  );
});

const MultiKeyWrapper = component$(() => {
  const { store, debouncedStore } = useDebouncedStore(
    { first: "", last: "" },
    50,
  );
  return (
    <div>
      <span id="store-first">{store.first}</span>
      <span id="store-last">{store.last}</span>
      <span id="debounced-first">{debouncedStore.first}</span>
      <span id="debounced-last">{debouncedStore.last}</span>
      <button id="btn-patch" onClick$={() => (store.first = "Bob")}>
        Patch first
      </button>
    </div>
  );
});

// ---------------------------------------------------------------------------
// [SSR]
// ---------------------------------------------------------------------------

describe("[SSR]", () => {
  test("renders initial values", async () => {
    const result = await renderToString(<InitialWrapper />, {
      containerTagName: "div",
    });
    expect(result.html).toContain("Alice");
    expect(result.html).toContain("30");
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

  test("renders initial values", async () => {
    const { screen, render } = await createDOM();
    await render(<InitialWrapper />);
    expect(screen.querySelector("#store-name")!.textContent).toBe("Alice");
    expect(screen.querySelector("#store-age")!.textContent).toBe("30");
    expect(screen.querySelector("#debounced-name")!.textContent).toBe("Alice");
    expect(screen.querySelector("#debounced-age")!.textContent).toBe("30");
  });

  test("with delay=0, both stores update synchronously", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ZeroDelayWrapper />);

    await userEvent("#btn", "click");

    expect(screen.querySelector("#store-query")!.textContent).toBe("immediate");
    expect(screen.querySelector("#debounced-query")!.textContent).toBe(
      "immediate",
    );
  });

  test("store updates immediately on set", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    await userEvent("#btn-a", "click");

    expect(screen.querySelector("#store-query")!.textContent).toBe("a");
  });

  test("debouncedStore does not update before delay elapses", async () => {
    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    await userEvent("#btn-a", "click");

    expect(screen.querySelector("#store-query")!.textContent).toBe("a");
    // Timer has not fired yet — debouncedStore remains at its initial value.
    expect(screen.querySelector("#debounced-query")!.textContent).toBe("");
  });

  test("rapid successive calls reset the timer each time", async () => {
    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    // Both buttons are clicked before the debounce delay elapses.
    await userEvent("#btn-a", "click");
    await userEvent("#btn-b", "click");

    // store is up-to-date with the last write
    expect(screen.querySelector("#store-query")!.textContent).toBe("b");
    // debouncedStore has not fired yet
    expect(screen.querySelector("#debounced-query")!.textContent).toBe("");
  });

  test("partial patch does not affect unpatched keys in store", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<MultiKeyWrapper />);

    await userEvent("#btn-patch", "click");

    // store.first is updated; store.last remains empty
    expect(screen.querySelector("#store-first")!.textContent).toBe("Bob");
    expect(screen.querySelector("#store-last")!.textContent).toBe("");
  });

  test("deleting a key from `store` also removes it from `debouncedStore`", async () => {
    const DeleteKeyWrapper = component$(() => {
      const { store, debouncedStore } = useDebouncedStore<{
        a: number;
        b?: number;
      }>({ a: 1, b: 2 }, 50);
      return (
        <div>
          <span id="store-keys">{JSON.stringify(Object.keys(store))}</span>
          <span id="debounced-keys">
            {JSON.stringify(Object.keys(debouncedStore))}
          </span>
          <span id="debounced-b">{String(debouncedStore.b)}</span>
          <button
            id="btn-delete"
            onClick$={() => {
              delete store.b;
            }}
          >
            Delete b
          </button>
          <button id="btn-flush" onClick$={() => {}} />
        </div>
      );
    });

    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<DeleteKeyWrapper />);

    await userEvent("#btn-delete", "click");
    expect(screen.querySelector("#store-keys")!.textContent).toBe(
      JSON.stringify(["a"]),
    );

    // Advance past the debounce delay so the timer fires under fake-timer
    // control (no real timer can leak past test teardown).
    await vi.advanceTimersByTimeAsync(100);
    await userEvent("#btn-flush", "click");

    // `debouncedStore` no longer has `b` — `syncStore` strips stale keys
    // before copying the snapshot.
    expect(screen.querySelector("#debounced-keys")!.textContent).toBe(
      JSON.stringify(["a"]),
    );
    expect(screen.querySelector("#debounced-b")!.textContent).toBe("undefined");
  });

  test("writes across multiple keys are all debounced together", async () => {
    // Mirrors the MultiField storybook: three independent keys are patched
    // in rapid succession; `debouncedStore` should remain at its initial
    // empty state until the delay elapses, then flush all three at once.
    const MultiFieldWrapper = component$(() => {
      const { store, debouncedStore } = useDebouncedStore(
        { first: "", last: "", email: "" },
        100,
      );
      return (
        <div>
          <span id="store-json">{JSON.stringify(store)}</span>
          <span id="debounced-json">{JSON.stringify(debouncedStore)}</span>
          <button id="btn-first" onClick$={() => (store.first = "Ada")}>
            Set first
          </button>
          <button id="btn-last" onClick$={() => (store.last = "Lovelace")}>
            Set last
          </button>
          <button id="btn-email" onClick$={() => (store.email = "a@b.c")}>
            Set email
          </button>
          <button id="btn-flush" onClick$={() => {}} />
        </div>
      );
    });

    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<MultiFieldWrapper />);

    await userEvent("#btn-first", "click");
    await userEvent("#btn-last", "click");
    await userEvent("#btn-email", "click");

    // store updates immediately on each click.
    expect(screen.querySelector("#store-json")!.textContent).toBe(
      JSON.stringify({ first: "Ada", last: "Lovelace", email: "a@b.c" }),
    );
    // Before the 100 ms delay elapses, debouncedStore is still empty.
    expect(screen.querySelector("#debounced-json")!.textContent).toBe(
      JSON.stringify({ first: "", last: "", email: "" }),
    );

    await vi.advanceTimersByTimeAsync(150);
    await userEvent("#btn-flush", "click");

    // After the delay, all three keys are flushed together.
    expect(screen.querySelector("#debounced-json")!.textContent).toBe(
      JSON.stringify({ first: "Ada", last: "Lovelace", email: "a@b.c" }),
    );
  });

  test("BUG: nested mutations bypass the debounce window (shared nested ref)", async () => {
    // Bug: `useStore({ ...initialValue })` only spreads the top level.
    // `store` and `debouncedStore` therefore share the same nested object,
    // so mutating `store.user.name` instantly mutates `debouncedStore.user.name`
    // without ever waiting for the debounce timer.
    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<NestedWrapper />);

    await userEvent("#btn", "click");

    // store reflects the write immediately — expected.
    expect(screen.querySelector("#store-name")!.textContent).toBe("Bob");
    // debouncedStore should still hold the initial value because the
    // 50 ms timer has not fired (fake timers, no advancement).
    expect(screen.querySelector("#debounced-name")!.textContent).toBe("Alice");
  });
});
