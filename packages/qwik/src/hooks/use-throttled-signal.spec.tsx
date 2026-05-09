import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { createDOM } from "@builder.io/qwik/testing";
import { renderToString } from "@builder.io/qwik/server";
import { component$ } from "@builder.io/qwik";

import { useThrottledSignal } from "./use-throttled-signal";

// ---------------------------------------------------------------------------
// Wrapper components used by tests
// ---------------------------------------------------------------------------

const InitialWrapper = component$(() => {
  const { signal, throttledSignal } = useThrottledSignal("hello", 200);
  return (
    <div>
      <span id="signal">{signal.value}</span>
      <span id="throttled">{throttledSignal.value}</span>
    </div>
  );
});

const SetterWrapper = component$(() => {
  const { signal, throttledSignal, set } = useThrottledSignal("", 200);
  return (
    <div>
      <span id="signal">{signal.value}</span>
      <span id="throttled">{throttledSignal.value}</span>
      <button id="btn-a" onClick$={() => set("a")}>
        Set A
      </button>
      <button id="btn-b" onClick$={() => set("b")}>
        Set B
      </button>
    </div>
  );
});

const ZeroIntervalWrapper = component$(() => {
  const { signal, throttledSignal, set } = useThrottledSignal("", 0);
  return (
    <div>
      <span id="signal">{signal.value}</span>
      <span id="throttled">{throttledSignal.value}</span>
      <button id="btn" onClick$={() => set("immediate")}>
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
    expect(screen.querySelector("#throttled")!.textContent).toBe("hello");
  });

  test("with interval=0, both signals update synchronously", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<ZeroIntervalWrapper />);

    await userEvent("#btn", "click");

    expect(screen.querySelector("#signal")!.textContent).toBe("immediate");
    expect(screen.querySelector("#throttled")!.textContent).toBe("immediate");
  });

  test("first call fires on leading edge — both signals update", async () => {
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    await userEvent("#btn-a", "click");

    expect(screen.querySelector("#signal")!.textContent).toBe("a");
    expect(screen.querySelector("#throttled")!.textContent).toBe("a");
  });

  test("second call within window is suppressed for throttledSignal", async () => {
    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    // First click fires on leading edge.
    await userEvent("#btn-a", "click");
    expect(screen.querySelector("#signal")!.textContent).toBe("a");
    expect(screen.querySelector("#throttled")!.textContent).toBe("a");

    // Second click within the throttle window — signal updates, throttledSignal does not.
    await userEvent("#btn-b", "click");
    expect(screen.querySelector("#signal")!.textContent).toBe("b");
    expect(screen.querySelector("#throttled")!.textContent).toBe("a");
  });

  test("rapid successive calls keep throttledSignal at first written value", async () => {
    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    await userEvent("#btn-a", "click");
    await userEvent("#btn-b", "click");
    await userEvent("#btn-a", "click");

    // signal is up-to-date
    expect(screen.querySelector("#signal")!.textContent).toBe("a");
    // throttledSignal is still the leading-edge value
    expect(screen.querySelector("#throttled")!.textContent).toBe("a");
  });
});
