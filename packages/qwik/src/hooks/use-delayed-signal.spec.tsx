import { component$ } from "@qwik.dev/core";
import { createDOM } from "@qwik.dev/core/testing";
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
const OverlappingDispatchWrapper = component$(() => {
  const { signal, delayedSignal, dispatch } = useDelayedSignal("initial");
  return (
    <div>
      <span id="signal">{signal.value}</span>
      <span id="delayed">{delayedSignal.value}</span>
      <button id="dispatch-a" onClick$={() => dispatch("a", 1000)}>
        A
      </button>
      <button id="dispatch-b" onClick$={() => dispatch("b", 500)}>
        B
      </button>
    </div>
  );
});

/** Used for the synchronous-write (no-delay) path. */
const ImmediateWrapper = component$(() => {
  const { signal, delayedSignal, dispatch } = useDelayedSignal("initial");
  return (
    <div>
      <span id="signal">{signal.value}</span>
      <span id="delayed">{delayedSignal.value}</span>
      <button id="dispatch" onClick$={() => dispatch("now")}>
        Now
      </button>
    </div>
  );
});

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
    const { screen, render, userEvent } = await createDOM();
    await render(<ImmediateWrapper />);

    await userEvent("#dispatch", "click");

    expect(screen.querySelector("#signal")!.textContent).toBe("now");
    expect(screen.querySelector("#delayed")!.textContent).toBe("now");
  });

  test("eager signal updates immediately, delayedSignal waits for the timer", async () => {
    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<OverlappingDispatchWrapper />);

    await userEvent("#dispatch-a", "click");

    // Eager signal reflects the write right away.
    expect(screen.querySelector("#signal")!.textContent).toBe("a");
    // Timer has not fired yet — delayedSignal is still the seed value.
    expect(screen.querySelector("#delayed")!.textContent).toBe("initial");

    await vi.advanceTimersByTimeAsync(1000);
    expect(screen.querySelector("#delayed")!.textContent).toBe("a");
  });

  // -------------------------------------------------------------------------
  // Repro: overlapping dispatches do not cancel each other.
  //
  // 1. dispatch("a", 1000) — arms timer T1 (fires at t=1000ms).
  // 2. immediately dispatch("b", 500) — arms timer T2 (fires at t=500ms).
  // 3. At t=500, T2 fires: delayedSignal = "b". Correct so far.
  // 4. At t=1000, T1 *also* fires (it was never cancelled): delayedSignal = "a".
  //
  // The user sees a→b→a flicker even though "b" was the newer command.
  // -------------------------------------------------------------------------
  test("a later dispatch must cancel the earlier pending dispatch", async () => {
    vi.useFakeTimers();
    const { screen, render, userEvent } = await createDOM();
    await render(<OverlappingDispatchWrapper />);

    await userEvent("#dispatch-a", "click");
    await userEvent("#dispatch-b", "click");

    // Advance just past the "b" timer.
    await vi.advanceTimersByTimeAsync(500);
    expect(screen.querySelector("#delayed")!.textContent).toBe("b");

    // Advance past the "a" timer's original deadline. The "a" timer should
    // have been cancelled when "b" was dispatched, so delayedSignal must
    // remain "b" — not flip back to "a".
    await vi.advanceTimersByTimeAsync(600);
    expect(screen.querySelector("#delayed")!.textContent).toBe("b");
  });
});
