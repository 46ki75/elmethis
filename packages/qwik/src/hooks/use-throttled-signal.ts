import { $, type NoSerialize, noSerialize, type QRL, useSignal } from "@builder.io/qwik";

/**
 * Returns a signal pair and a throttled setter.
 *
 * `signal` reflects the most recently written value immediately.
 * `throttledSignal` reflects the value on the *leading edge* of each
 * throttle window: the first call within any `interval` ms window fires
 * at once; subsequent calls within the same window are suppressed.
 * Once the window expires the next call will fire immediately again.
 *
 * When `interval` is 0 or negative, `throttledSignal` is updated
 * synchronously alongside `signal` (no throttling).
 *
 * @param initialValue - The initial value for both signals.
 * @param interval - Throttle interval in milliseconds.
 *
 * @example
 * ```tsx
 * const { signal, throttledSignal, set } = useThrottledSignal(0, 200);
 *
 * // signal.value updates on every mousemove
 * // throttledSignal.value updates at most once every 200 ms
 * <div onMouseMove$={(e) => set(e.clientX)} />
 * ```
 */
export const useThrottledSignal = <T>(
  initialValue: Parameters<typeof useSignal<T>>[0],
  interval: number,
) => {
  const signal = useSignal<T>(initialValue);
  const throttledSignal = useSignal<T>(initialValue);
  const timeoutId = useSignal<
    NoSerialize<ReturnType<typeof setTimeout>> | undefined
  >(undefined);

  const set: QRL<(value: T) => void> = $((value: T) => {
    signal.value = value;

    if (interval <= 0) {
      throttledSignal.value = value;
      return;
    }

    // Leading edge: only fire if the cooldown window is not active.
    if (timeoutId.value === undefined) {
      throttledSignal.value = value;
      timeoutId.value = noSerialize(
        setTimeout(() => {
          timeoutId.value = undefined;
        }, interval),
      );
    }
  });

  return { signal, throttledSignal, set };
};
