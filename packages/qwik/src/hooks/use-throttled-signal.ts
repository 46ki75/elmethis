import {
  noSerialize,
  useSignal,
  useTask$,
  type NoSerialize,
} from "@builder.io/qwik";

/**
 * Returns a reactive signal pair where writing to `signal` drives a
 * leading + trailing edge throttled update to `throttledSignal`.
 *
 * `signal` reflects every write immediately.
 * `throttledSignal` updates on the *leading edge* of each throttle window:
 * the first write within any `interval` ms window propagates at once. Further
 * writes within the same window are suppressed, but the most recent suppressed
 * value is delivered on the *trailing edge* when the window expires, and a
 * fresh window starts.
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
  const isCooling = useSignal(false);
  const cooldownId = useSignal<
    NoSerialize<ReturnType<typeof setTimeout>> | undefined
  >(undefined);

  // Unmount-only cleanup: clears any pending cooldown timer. Kept in its own
  // task so the cleanup does not fire on every re-run of the tracking task,
  // which would clobber an in-flight cooldown.
  useTask$(({ cleanup }) => {
    cleanup(() => {
      if (cooldownId.value !== undefined) clearTimeout(cooldownId.value);
    });
  });

  useTask$(({ track }) => {
    const value = track(() => signal.value);

    if (interval <= 0) {
      throttledSignal.value = value;
      return;
    }

    const arm = () => {
      isCooling.value = true;
      cooldownId.value = noSerialize(
        setTimeout(() => {
          cooldownId.value = undefined;
          isCooling.value = false;
          if (signal.value !== throttledSignal.value) {
            throttledSignal.value = signal.value;
            arm();
          }
        }, interval),
      );
    };

    if (cooldownId.value === undefined) {
      if (value === throttledSignal.value) return;
      throttledSignal.value = value;
      arm();
    }
    // else: write suppressed; trailing-edge fire will pick it up.
  });

  return { signal, throttledSignal, isCooling };
};
