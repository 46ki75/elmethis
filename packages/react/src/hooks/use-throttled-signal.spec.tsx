import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { useThrottledSignal } from "./use-throttled-signal";

// ---------------------------------------------------------------------------
// Wrapper components used by tests
// ---------------------------------------------------------------------------

const InitialWrapper = () => {
  const { value, throttledValue } = useThrottledSignal("hello", 200);
  return (
    <div>
      <span id="signal">{value}</span>
      <span id="throttled">{throttledValue}</span>
    </div>
  );
};

const SetterWrapper = () => {
  const { value, setValue, throttledValue } = useThrottledSignal("", 200);
  return (
    <div>
      <span id="signal">{value}</span>
      <span id="throttled">{throttledValue}</span>
      <button id="btn-a" onClick={() => setValue("a")}>
        Set A
      </button>
      <button id="btn-b" onClick={() => setValue("b")}>
        Set B
      </button>
    </div>
  );
};

const TrailingWrapper = () => {
  const { value, setValue, throttledValue } = useThrottledSignal("", 50);
  return (
    <div>
      <span id="signal">{value}</span>
      <span id="throttled">{throttledValue}</span>
      <button id="btn-a" onClick={() => setValue("a")}>
        Set A
      </button>
      <button id="btn-b" onClick={() => setValue("b")}>
        Set B
      </button>
    </div>
  );
};

const ZeroIntervalWrapper = () => {
  const { value, setValue, throttledValue } = useThrottledSignal("", 0);
  return (
    <div>
      <span id="signal">{value}</span>
      <span id="throttled">{throttledValue}</span>
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
    expect(container.querySelector("#throttled")!.textContent).toBe("hello");
  });

  test("with interval=0, both signals update synchronously", () => {
    const { container } = render(<ZeroIntervalWrapper />);

    fireEvent.click(container.querySelector("#btn")!);

    expect(container.querySelector("#signal")!.textContent).toBe("immediate");
    expect(container.querySelector("#throttled")!.textContent).toBe(
      "immediate",
    );
  });

  test("first call fires on leading edge — both signals update", () => {
    const { container } = render(<SetterWrapper />);

    fireEvent.click(container.querySelector("#btn-a")!);

    expect(container.querySelector("#signal")!.textContent).toBe("a");
    expect(container.querySelector("#throttled")!.textContent).toBe("a");
  });

  test("second call within window is suppressed for throttledValue", () => {
    vi.useFakeTimers();
    const { container } = render(<SetterWrapper />);

    // First click fires on leading edge.
    fireEvent.click(container.querySelector("#btn-a")!);
    expect(container.querySelector("#signal")!.textContent).toBe("a");
    expect(container.querySelector("#throttled")!.textContent).toBe("a");

    // Second click within the throttle window — value updates, throttledValue does not.
    fireEvent.click(container.querySelector("#btn-b")!);
    expect(container.querySelector("#signal")!.textContent).toBe("b");
    expect(container.querySelector("#throttled")!.textContent).toBe("a");
  });

  test("rapid successive calls keep throttledValue at first written value during cooldown", () => {
    vi.useFakeTimers();
    const { container } = render(<SetterWrapper />);

    fireEvent.click(container.querySelector("#btn-a")!);
    fireEvent.click(container.querySelector("#btn-b")!);
    fireEvent.click(container.querySelector("#btn-a")!);

    // value is up-to-date
    expect(container.querySelector("#signal")!.textContent).toBe("a");
    // throttledValue is still the leading-edge value while the cooldown is active
    expect(container.querySelector("#throttled")!.textContent).toBe("a");
  });

  test("trailing-edge value is delivered after the cooldown ends", async () => {
    // Short interval keeps the second cooldown (armed by the trailing flush)
    // finishing inside the test window, so no setTimeout leaks past teardown.
    const { container } = render(<TrailingWrapper />); // 50 ms interval

    fireEvent.click(container.querySelector("#btn-a")!); // leading-edge fire → throttled = "a"
    fireEvent.click(container.querySelector("#btn-b")!); // suppressed during cooldown

    expect(container.querySelector("#signal")!.textContent).toBe("b");
    expect(container.querySelector("#throttled")!.textContent).toBe("a");

    // Wait past two full intervals so both the trailing-flush cooldown and
    // the cooldown it re-arms have fired.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    expect(container.querySelector("#throttled")!.textContent).toBe("b");
  });
});
