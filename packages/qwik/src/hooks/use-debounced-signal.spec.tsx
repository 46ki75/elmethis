import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { createDOM } from "@builder.io/qwik/testing";
import { renderToString } from "@builder.io/qwik/server";
import { component$ } from "@builder.io/qwik";

import { useDebouncedSignal } from "./use-debounced-signal";

// Module-scoped counter so the lazy initializer can mutate it observably
// from the test body. Reset at the top of the lazy-initializer test.
let lazyInitCalls = 0;

// ---------------------------------------------------------------------------
// Wrapper components used by tests
// ---------------------------------------------------------------------------

const InitialWrapper = component$(() => {
  const { signal, debouncedSignal } = useDebouncedSignal("hello", 300);
  return (
    <div>
      <span id="signal">{signal.value}</span>
      <span id="debounced">{debouncedSignal.value}</span>
    </div>
  );
});

const SetterWrapper = component$(() => {
  const { signal, debouncedSignal } = useDebouncedSignal("", 50);
  return (
    <div>
      <span id="signal">{signal.value}</span>
      <span id="debounced">{debouncedSignal.value}</span>
      <button id="btn-a" onClick$={() => (signal.value = "a")}>
        Set A
      </button>
      <button id="btn-b" onClick$={() => (signal.value = "b")}>
        Set B
      </button>
    </div>
  );
});

const ZeroDelayWrapper = component$(() => {
  const { signal, debouncedSignal } = useDebouncedSignal("", 0);
  return (
    <div>
      <span id="signal">{signal.value}</span>
      <span id="debounced">{debouncedSignal.value}</span>
      <button id="btn" onClick$={() => (signal.value = "immediate")}>
        Set
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
    expect(result.html).toContain("hello");
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
    expect(screen.querySelector("#signal")!.textContent).toBe("hello");
    expect(screen.querySelector("#debounced")!.textContent).toBe("hello");
  });

  test("with delay=0, both signals update synchronously", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ZeroDelayWrapper />);

    await userEvent("#btn", "click");

    expect(screen.querySelector("#signal")!.textContent).toBe("immediate");
    expect(screen.querySelector("#debounced")!.textContent).toBe("immediate");
  });

  test("signal updates immediately on set", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    await userEvent("#btn-a", "click");

    expect(screen.querySelector("#signal")!.textContent).toBe("a");
  });

  test("debouncedSignal does not update before delay elapses", async () => {
    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    await userEvent("#btn-a", "click");

    expect(screen.querySelector("#signal")!.textContent).toBe("a");
    // Timer has not fired yet — debouncedSignal remains at its initial value.
    expect(screen.querySelector("#debounced")!.textContent).toBe("");
  });

  test("lazy initializer is invoked exactly once", async () => {
    // The hook resolves the initializer once and passes the resolved value
    // to both `useSignal` calls, so a side-effectful initializer fires once
    // even though we own two signals.
    lazyInitCalls = 0;

    const LazyInitWrapper = component$(() => {
      const { signal, debouncedSignal } = useDebouncedSignal<string>(() => {
        lazyInitCalls++;
        return "initial";
      }, 100);
      return (
        <div>
          <span id="signal">{signal.value}</span>
          <span id="debounced">{debouncedSignal.value}</span>
        </div>
      );
    });

    const { render, screen } = await createDOM();
    await render(<LazyInitWrapper />);

    expect(screen.querySelector("#signal")!.textContent).toBe("initial");
    expect(screen.querySelector("#debounced")!.textContent).toBe("initial");
    expect(lazyInitCalls).toBe(1);
  });

  test("rapid successive calls reset the timer each time", async () => {
    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    // Both buttons are clicked before the debounce delay elapses.
    await userEvent("#btn-a", "click");
    await userEvent("#btn-b", "click");

    // signal is up-to-date with the last write
    expect(screen.querySelector("#signal")!.textContent).toBe("b");
    // debouncedSignal has not fired yet
    expect(screen.querySelector("#debounced")!.textContent).toBe("");
  });
});
