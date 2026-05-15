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
  const { signal, throttledSignal } = useThrottledSignal("", 200);
  return (
    <div>
      <span id="signal">{signal.value}</span>
      <span id="throttled">{throttledSignal.value}</span>
      <button id="btn-a" onClick$={() => (signal.value = "a")}>
        Set A
      </button>
      <button id="btn-b" onClick$={() => (signal.value = "b")}>
        Set B
      </button>
      <button id="btn-flush" onClick$={() => {}} />
    </div>
  );
});

const TrailingWrapper = component$(() => {
  const { signal, throttledSignal } = useThrottledSignal("", 50);
  return (
    <div>
      <span id="signal">{signal.value}</span>
      <span id="throttled">{throttledSignal.value}</span>
      <button id="btn-a" onClick$={() => (signal.value = "a")}>
        Set A
      </button>
      <button id="btn-b" onClick$={() => (signal.value = "b")}>
        Set B
      </button>
      <button id="btn-flush" onClick$={() => {}} />
    </div>
  );
});

const ZeroIntervalWrapper = component$(() => {
  const { signal, throttledSignal } = useThrottledSignal("", 0);
  return (
    <div>
      <span id="signal">{signal.value}</span>
      <span id="throttled">{throttledSignal.value}</span>
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

  test("rapid successive calls keep throttledSignal at first written value during cooldown", async () => {
    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<SetterWrapper />);

    await userEvent("#btn-a", "click");
    await userEvent("#btn-b", "click");
    await userEvent("#btn-a", "click");

    // signal is up-to-date
    expect(screen.querySelector("#signal")!.textContent).toBe("a");
    // throttledSignal is still the leading-edge value while the cooldown is active
    expect(screen.querySelector("#throttled")!.textContent).toBe("a");
  });

  test("trailing-edge value is delivered after the cooldown ends", async () => {
    // Short interval keeps the second cooldown (armed by the trailing flush)
    // finishing inside the test window, so no setTimeout leaks past teardown.
    const { screen, render, userEvent } = await createDOM();
    await render(<TrailingWrapper />); // 50 ms interval

    await userEvent("#btn-a", "click"); // leading-edge fire → throttled = "a"
    await userEvent("#btn-b", "click"); // suppressed during cooldown

    expect(screen.querySelector("#signal")!.textContent).toBe("b");
    expect(screen.querySelector("#throttled")!.textContent).toBe("a");

    // Wait past two full intervals so both the trailing-flush cooldown and
    // the cooldown it re-arms have fired.
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Qwik's test platform only flushes pending renders inside userEvent /
    // render. A no-op click pumps the scheduler so the render queued by the
    // trailing-edge signal write becomes visible.
    await userEvent("#btn-flush", "click");

    expect(screen.querySelector("#throttled")!.textContent).toBe("b");
  });
});
