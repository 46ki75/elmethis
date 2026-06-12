import { render } from "@testing-library/react";
import { act } from "react";
import { afterEach, beforeEach, describe, expect, test, vi } from "vitest";

import { useDelayedSignal } from "./use-delayed-signal";

// ---------------------------------------------------------------------------
// Wrapper components
// ---------------------------------------------------------------------------

/**
 * Exposes two buttons that schedule writes with different values and delays.
 * `#dispatch-a` writes "a" with a 1000ms delay.
 * `#dispatch-b` writes "b" with a 500ms delay.
 *
 * Used to test that calling `dispatch` while a previous timer is still pending
 * cancels the older timer instead of letting it fire later and clobber the
 * newer value.
 */
const OverlappingDispatchWrapper = () => {
  const { value, delayedValue, dispatch } = useDelayedSignal("initial");
  return (
    <div>
      <span id="signal">{value}</span>
      <span id="delayed">{delayedValue}</span>
      <button id="dispatch-a" onClick={() => dispatch("a", 1000)}>
        A
      </button>
      <button id="dispatch-b" onClick={() => dispatch("b", 500)}>
        B
      </button>
    </div>
  );
};

/** Used for the synchronous-write (no-delay) path. */
const ImmediateWrapper = () => {
  const { value, delayedValue, dispatch } = useDelayedSignal("initial");
  return (
    <div>
      <span id="signal">{value}</span>
      <span id="delayed">{delayedValue}</span>
      <button id="dispatch" onClick={() => dispatch("now")}>
        Now
      </button>
    </div>
  );
};

// ---------------------------------------------------------------------------
// [CSR]
// ---------------------------------------------------------------------------

describe("[CSR] useDelayedSignal", () => {
  beforeEach(() => {
    vi.useRealTimers();
  });

  afterEach(() => {
    vi.clearAllTimers();
    vi.useRealTimers();
  });

  test("zero / undefined delay writes both signals synchronously", async () => {
    const { container } = render(<ImmediateWrapper />);

    act(() => {
      container.querySelector<HTMLButtonElement>("#dispatch")!.click();
    });

    expect(container.querySelector("#signal")!.textContent).toBe("now");
    expect(container.querySelector("#delayed")!.textContent).toBe("now");
  });

  test("eager signal updates immediately, delayedValue waits for the timer", async () => {
    vi.useFakeTimers();
    const { container } = render(<OverlappingDispatchWrapper />);

    act(() => {
      container.querySelector<HTMLButtonElement>("#dispatch-a")!.click();
    });

    // Eager signal reflects the write right away.
    expect(container.querySelector("#signal")!.textContent).toBe("a");
    // Timer has not fired yet — delayedValue is still the seed value.
    expect(container.querySelector("#delayed")!.textContent).toBe("initial");

    await act(async () => {
      await vi.advanceTimersByTimeAsync(1000);
    });
    expect(container.querySelector("#delayed")!.textContent).toBe("a");
  });

  // -------------------------------------------------------------------------
  // Repro: overlapping dispatches do not cancel each other.
  //
  // 1. dispatch("a", 1000) — arms timer T1 (fires at t=1000ms).
  // 2. immediately dispatch("b", 500) — arms timer T2 (fires at t=500ms).
  // 3. At t=500, T2 fires: delayedValue = "b". Correct so far.
  // 4. At t=1000, T1 *also* fires (it was never cancelled): delayedValue = "a".
  //
  // The user sees a→b→a flicker even though "b" was the newer command.
  // -------------------------------------------------------------------------
  test("a later dispatch must cancel the earlier pending dispatch", async () => {
    vi.useFakeTimers();
    const { container } = render(<OverlappingDispatchWrapper />);

    act(() => {
      container.querySelector<HTMLButtonElement>("#dispatch-a")!.click();
    });
    act(() => {
      container.querySelector<HTMLButtonElement>("#dispatch-b")!.click();
    });

    // Advance just past the "b" timer.
    await act(async () => {
      await vi.advanceTimersByTimeAsync(500);
    });
    expect(container.querySelector("#delayed")!.textContent).toBe("b");

    // Advance past the "a" timer's original deadline. The "a" timer should
    // have been cancelled when "b" was dispatched, so delayedValue must
    // remain "b" — not flip back to "a".
    await act(async () => {
      await vi.advanceTimersByTimeAsync(600);
    });
    expect(container.querySelector("#delayed")!.textContent).toBe("b");
  });
});
