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
});
