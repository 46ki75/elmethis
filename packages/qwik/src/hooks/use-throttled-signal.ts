import { useSignal, useTask$ } from "@builder.io/qwik";

/**
 * Returns a reactive signal pair where writing to `signal` drives a
 * leading-edge throttled update to `throttledSignal`.
 *
 * `signal` reflects every write immediately.
 * `throttledSignal` updates on the *leading edge* of each throttle window:
 * the first write within any `interval` ms window propagates at once;
 * subsequent writes within the same window are suppressed.
 * Once the window expires the next write fires immediately again.
 *
 * `isCooling` is `true` while the throttle cooldown window is active.
 *
 * When `interval` is 0 or negative, `throttledSignal` is updated
 * synchronously alongside `signal` (no throttling).
 *
 * @param initialValue - The initial value for both signals.
 * @param interval - Throttle interval in milliseconds.
 *
 * @example
 * ```tsx
 * const { signal, throttledSignal, isCooling } = useThrottledSignal(0, 200);
 *
 * // signal.value updates on every mousemove
 * // throttledSignal.value updates at most once every 200 ms
 * <div onMouseMove$={(e) => (signal.value = e.clientX)} />
 * ```
 */
export const useThrottledSignal = <T>(
  initialValue: Parameters<typeof useSignal<T>>[0],
  interval: number,
) => {
  const signal = useSignal<T>(initialValue);
  const throttledSignal = useSignal<T>(initialValue);
  // Not passed to track() — read as a plain gate, not a reactive dependency.
  const isCooling = useSignal(false);

  useTask$(({ track }) => {
    const value = track(() => signal.value);

    if (interval <= 0) {
      throttledSignal.value = value;
      return;
    }

    // Skip the initial run when both signals are in sync and no cooldown is active.
    if (value === throttledSignal.value && !isCooling.value) {
      return;
    }

    // Leading edge: fire only if the cooldown window is not active.
    if (!isCooling.value) {
      throttledSignal.value = value;
      isCooling.value = true;
      setTimeout(() => {
        isCooling.value = false;
      }, interval);
    }
    // else: suppressed within the cooldown window
  });

  return { signal, throttledSignal, isCooling };
};
