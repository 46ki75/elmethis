import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { act, fireEvent, render } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { useDebouncedSignal } from "./use-debounced-signal";

// Module-scoped counter so the lazy initializer can mutate it observably
// from the test body. Reset at the top of the lazy-initializer test.
let lazyInitCalls = 0;

// ---------------------------------------------------------------------------
// Wrapper components used by tests
// ---------------------------------------------------------------------------

const InitialWrapper = () => {
  const { value, debouncedValue } = useDebouncedSignal("hello", 300);
  return (
    <div>
      <span id="signal">{value}</span>
      <span id="debounced">{debouncedValue}</span>
    </div>
  );
};

const SetterWrapper = () => {
  const { value, setValue, debouncedValue } = useDebouncedSignal("", 50);
  return (
    <div>
      <span id="signal">{value}</span>
      <span id="debounced">{debouncedValue}</span>
      <button id="btn-a" onClick={() => setValue("a")}>
        Set A
      </button>
      <button id="btn-b" onClick={() => setValue("b")}>
        Set B
      </button>
    </div>
  );
};

const ZeroDelayWrapper = () => {
  const { value, setValue, debouncedValue } = useDebouncedSignal("", 0);
  return (
    <div>
      <span id="signal">{value}</span>
      <span id="debounced">{debouncedValue}</span>
      <button id="btn" onClick={() => setValue("immediate")}>
        Set
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
    expect(html).toContain("hello");
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
    expect(container.querySelector("#signal")!.textContent).toBe("hello");
    expect(container.querySelector("#debounced")!.textContent).toBe("hello");
  });

  test("with delay=0, both signals update synchronously", () => {
    const { container } = render(<ZeroDelayWrapper />);

    fireEvent.click(container.querySelector("#btn")!);

    expect(container.querySelector("#signal")!.textContent).toBe("immediate");
    expect(container.querySelector("#debounced")!.textContent).toBe(
      "immediate",
    );
  });

  test("value updates immediately on set", () => {
    const { container } = render(<SetterWrapper />);

    fireEvent.click(container.querySelector("#btn-a")!);

    expect(container.querySelector("#signal")!.textContent).toBe("a");
  });

  test("debouncedValue does not update before delay elapses", () => {
    vi.useFakeTimers();
    const { container } = render(<SetterWrapper />);

    fireEvent.click(container.querySelector("#btn-a")!);

    expect(container.querySelector("#signal")!.textContent).toBe("a");
    // Timer has not fired yet — debouncedValue remains at its initial value.
    expect(container.querySelector("#debounced")!.textContent).toBe("");
  });

  test("lazy initializer is invoked exactly once", () => {
    // The hook resolves the initializer once and passes the resolved value to
    // both state initializers, so a side-effectful initializer fires once even
    // though we own two pieces of state.
    lazyInitCalls = 0;

    const LazyInitWrapper = () => {
      const { value, debouncedValue } = useDebouncedSignal<string>(() => {
        lazyInitCalls++;
        return "initial";
      }, 100);
      return (
        <div>
          <span id="signal">{value}</span>
          <span id="debounced">{debouncedValue}</span>
        </div>
      );
    };

    const { container } = render(<LazyInitWrapper />);

    expect(container.querySelector("#signal")!.textContent).toBe("initial");
    expect(container.querySelector("#debounced")!.textContent).toBe("initial");
    expect(lazyInitCalls).toBe(1);
  });

  test("rapid successive calls reset the timer each time", () => {
    vi.useFakeTimers();
    const { container } = render(<SetterWrapper />);

    // Both buttons are clicked before the debounce delay elapses.
    fireEvent.click(container.querySelector("#btn-a")!);
    fireEvent.click(container.querySelector("#btn-b")!);

    // value is up-to-date with the last write
    expect(container.querySelector("#signal")!.textContent).toBe("b");
    // debouncedValue has not fired yet
    expect(container.querySelector("#debounced")!.textContent).toBe("");
  });

  test("debouncedValue commits after the delay elapses", () => {
    vi.useFakeTimers();
    const { container } = render(<SetterWrapper />);

    fireEvent.click(container.querySelector("#btn-a")!);
    expect(container.querySelector("#debounced")!.textContent).toBe("");

    act(() => {
      vi.advanceTimersByTime(50);
    });

    expect(container.querySelector("#debounced")!.textContent).toBe("a");
  });
});
