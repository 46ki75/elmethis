import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { createDOM } from "@builder.io/qwik/testing";
import { renderToString } from "@builder.io/qwik/server";
import { component$ } from "@builder.io/qwik";

import { useThrottledStore } from "./use-throttled-store";

// ---------------------------------------------------------------------------
// Wrapper components used by tests
// ---------------------------------------------------------------------------

const InitialWrapper = component$(() => {
  const { store, throttledStore } = useThrottledStore(
    { name: "Alice", age: 30 },
    200,
  );
  return (
    <div>
      <span id="store-name">{store.name}</span>
      <span id="store-age">{store.age}</span>
      <span id="throttled-name">{throttledStore.name}</span>
      <span id="throttled-age">{throttledStore.age}</span>
    </div>
  );
});

const SetterWrapper = component$(() => {
  const { store, throttledStore, set } = useThrottledStore({ query: "" }, 200);
  return (
    <div>
      <span id="store-query">{store.query}</span>
      <span id="throttled-query">{throttledStore.query}</span>
      <button id="btn-a" onClick$={() => set({ query: "a" })}>
        Set A
      </button>
      <button id="btn-b" onClick$={() => set({ query: "b" })}>
        Set B
      </button>
    </div>
  );
});

const ZeroIntervalWrapper = component$(() => {
  const { store, throttledStore, set } = useThrottledStore({ query: "" }, 0);
  return (
    <div>
      <span id="store-query">{store.query}</span>
      <span id="throttled-query">{throttledStore.query}</span>
      <button id="btn" onClick$={() => set({ query: "immediate" })}>
        Set
      </button>
    </div>
  );
});

const MultiKeyWrapper = component$(() => {
  const { store, throttledStore, set } = useThrottledStore(
    { first: "", last: "" },
    200,
  );
  return (
    <div>
      <span id="store-first">{store.first}</span>
      <span id="store-last">{store.last}</span>
      <span id="throttled-first">{throttledStore.first}</span>
      <span id="throttled-last">{throttledStore.last}</span>
      <button id="btn-patch" onClick$={() => set({ first: "Bob" })}>
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
    expect(screen.querySelector("#throttled-name")!.textContent).toBe("Alice");
    expect(screen.querySelector("#throttled-age")!.textContent).toBe("30");
  });

  test("with interval=0, both stores update synchronously", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ZeroIntervalWrapper />);

    await userEvent("#btn", "click");

    expect(screen.querySelector("#store-query")!.textContent).toBe("immediate");
    expect(screen.querySelector("#throttled-query")!.textContent).toBe(
      "immediate",
    );
  });

  test("first call fires on leading edge — both stores update", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    await userEvent("#btn-a", "click");

    expect(screen.querySelector("#store-query")!.textContent).toBe("a");
    expect(screen.querySelector("#throttled-query")!.textContent).toBe("a");
  });

  test("second call within window is suppressed for throttledStore", async () => {
    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    // First click fires on leading edge.
    await userEvent("#btn-a", "click");
    expect(screen.querySelector("#store-query")!.textContent).toBe("a");
    expect(screen.querySelector("#throttled-query")!.textContent).toBe("a");

    // Second click within the throttle window — store updates, throttledStore does not.
    await userEvent("#btn-b", "click");
    expect(screen.querySelector("#store-query")!.textContent).toBe("b");
    expect(screen.querySelector("#throttled-query")!.textContent).toBe("a");
  });

  test("rapid successive calls keep throttledStore at first written value", async () => {
    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    await userEvent("#btn-a", "click");
    await userEvent("#btn-b", "click");
    await userEvent("#btn-a", "click");

    // store is up-to-date
    expect(screen.querySelector("#store-query")!.textContent).toBe("a");
    // throttledStore is still the leading-edge value
    expect(screen.querySelector("#throttled-query")!.textContent).toBe("a");
  });

  test("partial patch does not affect unpatched keys in store", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<MultiKeyWrapper />);

    await userEvent("#btn-patch", "click");

    expect(screen.querySelector("#store-first")!.textContent).toBe("Bob");
    expect(screen.querySelector("#store-last")!.textContent).toBe("");
    expect(screen.querySelector("#throttled-first")!.textContent).toBe("Bob");
    expect(screen.querySelector("#throttled-last")!.textContent).toBe("");
  });
});
