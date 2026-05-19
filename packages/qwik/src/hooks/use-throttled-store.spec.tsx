import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { createDOM } from "@qwik.dev/core/testing";
import { renderToString } from "@qwik.dev/core/server";
import { component$ } from "@qwik.dev/core";

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
  const { store, throttledStore } = useThrottledStore({ query: "" }, 200);
  return (
    <div>
      <span id="store-query">{store.query}</span>
      <span id="throttled-query">{throttledStore.query}</span>
      <button id="btn-a" onClick$={() => (store.query = "a")}>
        Set A
      </button>
      <button id="btn-b" onClick$={() => (store.query = "b")}>
        Set B
      </button>
    </div>
  );
});

const ZeroIntervalWrapper = component$(() => {
  const { store, throttledStore } = useThrottledStore({ query: "" }, 0);
  return (
    <div>
      <span id="store-query">{store.query}</span>
      <span id="throttled-query">{throttledStore.query}</span>
      <button id="btn" onClick$={() => (store.query = "immediate")}>
        Set
      </button>
    </div>
  );
});

const TrailingWrapper = component$(() => {
  const { store, throttledStore } = useThrottledStore({ query: "" }, 50);
  return (
    <div>
      <span id="store-query">{store.query}</span>
      <span id="throttled-query">{throttledStore.query}</span>
      <button id="btn-a" onClick$={() => (store.query = "a")}>
        Set A
      </button>
      <button id="btn-b" onClick$={() => (store.query = "b")}>
        Set B
      </button>
      <button id="btn-flush" onClick$={() => {}} />
    </div>
  );
});

const MultiKeyWrapper = component$(() => {
  const { store, throttledStore } = useThrottledStore(
    { first: "", last: "" },
    200,
  );
  return (
    <div>
      <span id="store-first">{store.first}</span>
      <span id="store-last">{store.last}</span>
      <span id="throttled-first">{throttledStore.first}</span>
      <span id="throttled-last">{throttledStore.last}</span>
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

  test("rapid successive calls keep throttledStore at first written value during cooldown", async () => {
    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    await userEvent("#btn-a", "click");
    await userEvent("#btn-b", "click");
    await userEvent("#btn-a", "click");

    // store is up-to-date
    expect(screen.querySelector("#store-query")!.textContent).toBe("a");
    // throttledStore is still the leading-edge value while the cooldown is active
    expect(screen.querySelector("#throttled-query")!.textContent).toBe("a");
  });

  test("trailing-edge value is delivered after the cooldown ends", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<TrailingWrapper />); // 50 ms interval

    await userEvent("#btn-a", "click"); // leading-edge fire → throttled = "a"
    await userEvent("#btn-b", "click"); // suppressed during cooldown

    expect(screen.querySelector("#store-query")!.textContent).toBe("b");
    expect(screen.querySelector("#throttled-query")!.textContent).toBe("a");

    // Wait past two full intervals so both the trailing-flush cooldown and
    // the cooldown it re-arms have fired.
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Qwik's test platform only flushes pending renders inside userEvent /
    // render. A no-op click pumps the scheduler so the render queued by the
    // trailing-edge signal write becomes visible.
    await userEvent("#btn-flush", "click");

    expect(screen.querySelector("#throttled-query")!.textContent).toBe("b");
  });

  test("deleting a key from `store` also removes it from `throttledStore`", async () => {
    const DeleteKeyWrapper = component$(() => {
      const { store, throttledStore } = useThrottledStore<{
        a: number;
        b?: number;
      }>({ a: 1, b: 2 }, 50);
      return (
        <div>
          <span id="store-keys">{JSON.stringify(Object.keys(store))}</span>
          <span id="throttled-keys">
            {JSON.stringify(Object.keys(throttledStore))}
          </span>
          <span id="throttled-b">{String(throttledStore.b)}</span>
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

    // Advance past two intervals (leading + trailing windows) under
    // fake-timer control so no real timer can leak past test teardown.
    await vi.advanceTimersByTimeAsync(200);
    await userEvent("#btn-flush", "click");

    // `throttledStore` no longer has `b` — `syncStore` strips stale keys
    // before copying the snapshot, on both leading and trailing edge writes.
    expect(screen.querySelector("#throttled-keys")!.textContent).toBe(
      JSON.stringify(["a"]),
    );
    expect(screen.querySelector("#throttled-b")!.textContent).toBe("undefined");
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
