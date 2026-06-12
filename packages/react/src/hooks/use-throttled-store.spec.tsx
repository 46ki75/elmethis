import { describe, expect, test, vi, afterEach, beforeEach } from "vitest";
import { render, fireEvent, act } from "@testing-library/react";
import { renderToStaticMarkup } from "react-dom/server";

import { useThrottledStore } from "./use-throttled-store";

// ---------------------------------------------------------------------------
// Wrapper components used by tests
// ---------------------------------------------------------------------------

const InitialWrapper = () => {
  const { value, throttledValue } = useThrottledStore(
    { name: "Alice", age: 30 },
    200,
  );
  return (
    <div>
      <span id="store-name">{value.name}</span>
      <span id="store-age">{value.age}</span>
      <span id="throttled-name">{throttledValue.name}</span>
      <span id="throttled-age">{throttledValue.age}</span>
    </div>
  );
};

const SetterWrapper = () => {
  const { value, setValue, throttledValue } = useThrottledStore(
    { query: "" },
    200,
  );
  return (
    <div>
      <span id="store-query">{value.query}</span>
      <span id="throttled-query">{throttledValue.query}</span>
      <button id="btn-a" onClick={() => setValue({ query: "a" })}>
        Set A
      </button>
      <button id="btn-b" onClick={() => setValue({ query: "b" })}>
        Set B
      </button>
    </div>
  );
};

const ZeroIntervalWrapper = () => {
  const { value, setValue, throttledValue } = useThrottledStore(
    { query: "" },
    0,
  );
  return (
    <div>
      <span id="store-query">{value.query}</span>
      <span id="throttled-query">{throttledValue.query}</span>
      <button id="btn" onClick={() => setValue({ query: "immediate" })}>
        Set
      </button>
    </div>
  );
};

const TrailingWrapper = () => {
  const { value, setValue, throttledValue } = useThrottledStore(
    { query: "" },
    50,
  );
  return (
    <div>
      <span id="store-query">{value.query}</span>
      <span id="throttled-query">{throttledValue.query}</span>
      <button id="btn-a" onClick={() => setValue({ query: "a" })}>
        Set A
      </button>
      <button id="btn-b" onClick={() => setValue({ query: "b" })}>
        Set B
      </button>
    </div>
  );
};

const MultiKeyWrapper = () => {
  const { value, setValue, throttledValue } = useThrottledStore(
    { first: "", last: "" },
    200,
  );
  return (
    <div>
      <span id="store-first">{value.first}</span>
      <span id="store-last">{value.last}</span>
      <span id="throttled-first">{throttledValue.first}</span>
      <span id="throttled-last">{throttledValue.last}</span>
      <button
        id="btn-patch"
        onClick={() => setValue((prev) => ({ ...prev, first: "Bob" }))}
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
    expect(container.querySelector("#throttled-name")!.textContent).toBe(
      "Alice",
    );
    expect(container.querySelector("#throttled-age")!.textContent).toBe("30");
  });

  test("with interval=0, both stores update synchronously", () => {
    const { container } = render(<ZeroIntervalWrapper />);

    fireEvent.click(container.querySelector("#btn")!);

    expect(container.querySelector("#store-query")!.textContent).toBe(
      "immediate",
    );
    expect(container.querySelector("#throttled-query")!.textContent).toBe(
      "immediate",
    );
  });

  test("first call fires on leading edge — both stores update", () => {
    const { container } = render(<SetterWrapper />);

    fireEvent.click(container.querySelector("#btn-a")!);

    expect(container.querySelector("#store-query")!.textContent).toBe("a");
    expect(container.querySelector("#throttled-query")!.textContent).toBe("a");
  });

  test("second call within window is suppressed for throttledStore", () => {
    vi.useFakeTimers();
    const { container } = render(<SetterWrapper />);

    // First click fires on leading edge.
    fireEvent.click(container.querySelector("#btn-a")!);
    expect(container.querySelector("#store-query")!.textContent).toBe("a");
    expect(container.querySelector("#throttled-query")!.textContent).toBe("a");

    // Second click within the throttle window — store updates, throttledStore does not.
    fireEvent.click(container.querySelector("#btn-b")!);
    expect(container.querySelector("#store-query")!.textContent).toBe("b");
    expect(container.querySelector("#throttled-query")!.textContent).toBe("a");
  });

  test("rapid successive calls keep throttledStore at first written value during cooldown", () => {
    vi.useFakeTimers();
    const { container } = render(<SetterWrapper />);

    fireEvent.click(container.querySelector("#btn-a")!);
    fireEvent.click(container.querySelector("#btn-b")!);
    fireEvent.click(container.querySelector("#btn-a")!);

    // store is up-to-date
    expect(container.querySelector("#store-query")!.textContent).toBe("a");
    // throttledStore is still the leading-edge value while the cooldown is active
    expect(container.querySelector("#throttled-query")!.textContent).toBe("a");
  });

  test("trailing-edge value is delivered after the cooldown ends", async () => {
    // Short interval keeps the second cooldown (armed by the trailing flush)
    // finishing inside the test window, so no setTimeout leaks past teardown.
    const { container } = render(<TrailingWrapper />); // 50 ms interval

    fireEvent.click(container.querySelector("#btn-a")!); // leading-edge fire → throttled = "a"
    fireEvent.click(container.querySelector("#btn-b")!); // suppressed during cooldown

    expect(container.querySelector("#store-query")!.textContent).toBe("b");
    expect(container.querySelector("#throttled-query")!.textContent).toBe("a");

    // Wait past two full intervals so both the trailing-flush cooldown and
    // the cooldown it re-arms have fired.
    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 200));
    });

    expect(container.querySelector("#throttled-query")!.textContent).toBe("b");
  });

  test("partial patch does not affect unpatched keys in store", () => {
    const { container } = render(<MultiKeyWrapper />);

    fireEvent.click(container.querySelector("#btn-patch")!);

    expect(container.querySelector("#store-first")!.textContent).toBe("Bob");
    expect(container.querySelector("#store-last")!.textContent).toBe("");
    expect(container.querySelector("#throttled-first")!.textContent).toBe(
      "Bob",
    );
    expect(container.querySelector("#throttled-last")!.textContent).toBe("");
  });

  // A fresh object that is structurally equal to the current throttled value
  // must NOT arm a throttle window — equality between the two stores is
  // compared deeply, not by reference.
  test("setting a deeply-equal object does not change throttledStore", () => {
    const EqualWrapper = () => {
      const { setValue, throttledValue } = useThrottledStore(
        { query: "same" },
        200,
      );
      return (
        <div>
          <span id="throttled-query">{throttledValue.query}</span>
          <button id="btn-equal" onClick={() => setValue({ query: "same" })}>
            Set equal
          </button>
        </div>
      );
    };

    vi.useFakeTimers();
    const { container } = render(<EqualWrapper />);

    fireEvent.click(container.querySelector("#btn-equal")!);

    expect(container.querySelector("#throttled-query")!.textContent).toBe(
      "same",
    );
  });
});
