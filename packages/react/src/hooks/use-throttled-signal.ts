import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

export interface UseThrottledSignalReturn<T> {
  /** Reflects every write immediately. */
  value: T;
  /** Setter for `value`. Writing drives the throttled update. */
  setValue: Dispatch<SetStateAction<T>>;
  /** Leading + trailing edge throttled view of `value`. */
  throttledValue: T;
  /** `true` while the throttle cooldown window is active. */
  isCooling: boolean;
}

/**
 * Returns reactive state where writing to `value` drives a leading + trailing
 * edge throttled update to `throttledValue`.
 *
 * React port of qwik's `useThrottledSignal`. Qwik's signal model does not exist
 * in React, so where qwik returned a `{ signal, throttledSignal, isCooling }`
 * trio of `Signal<T>`, the React idiom returns
 * `{ value, setValue, throttledValue, isCooling }` — `value`/`setValue` is the
 * usual `useState` pair, `throttledValue` and `isCooling` are read-only.
 *
 * `value` reflects every write immediately.
 * `throttledValue` updates on the *leading edge* of each throttle window: the
 * first write within any `interval` ms window propagates at once. Further
 * writes within the same window are suppressed, but the most recent suppressed
 * value is delivered on the *trailing edge* when the window expires, and a
 * fresh window starts.
 *
 * `isCooling` is `true` while the throttle cooldown window is active.
 *
 * When `interval` is 0 or negative, `throttledValue` is updated synchronously
 * alongside `value` (no throttling).
 *
 * @param initialValue - The initial value for both `value` and `throttledValue`.
 * @param interval - Throttle interval in milliseconds.
 *
 * @example
 * ```tsx
 * const { value, setValue, throttledValue, isCooling } = useThrottledSignal(0, 200);
 *
 * // value updates on every mousemove
 * // throttledValue updates at most once every 200 ms
 * <div onMouseMove={(e) => setValue(e.clientX)} />
 * ```
 */
export const useThrottledSignal = <T>(
  initialValue: T | (() => T),
  interval: number,
): UseThrottledSignalReturn<T> => {
  // Resolve a lazy initializer once. Both states must seed from the same
  // resolved value so a side-effectful initializer runs exactly once.
  const [resolved] = useState<T>(initialValue);

  const [value, setValue] = useState<T>(resolved);
  const [throttledValue, setThrottledValue] = useState<T>(resolved);
  const [isCooling, setIsCooling] = useState(false);

  // Refs mirror the latest committed state so the throttle logic — which runs
  // outside React's render flow (inside a setTimeout) — can read fresh values.
  const valueRef = useRef(value);
  const throttledRef = useRef(throttledValue);
  const cooldownId = useRef<ReturnType<typeof setTimeout> | undefined>(
    undefined,
  );

  // Sync the latest-value refs after each commit (the timer callback runs
  // later, so reading `.current` then is always fresh).
  useEffect(() => {
    valueRef.current = value;
    throttledRef.current = throttledValue;
  });

  // Unmount-only cleanup: clears any pending cooldown timer.
  useEffect(() => {
    return () => {
      if (cooldownId.current !== undefined) clearTimeout(cooldownId.current);
    };
  }, []);

  useEffect(() => {
    if (interval <= 0) {
      // No throttling: mirror `value` synchronously. Set-state-in-effect is
      // intentional here — it is the passthrough path of a sync-external-state
      // hook, matching the qwik twin's `delay <= 0` branch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThrottledValue(value);
      return;
    }

    const arm = () => {
      setIsCooling(true);
      cooldownId.current = setTimeout(() => {
        cooldownId.current = undefined;
        setIsCooling(false);
        if (valueRef.current !== throttledRef.current) {
          throttledRef.current = valueRef.current;
          setThrottledValue(valueRef.current);
          arm();
        }
      }, interval);
    };

    if (cooldownId.current === undefined) {
      if (value === throttledRef.current) return;
      throttledRef.current = value;
      setThrottledValue(value);
      arm();
    }
    // else: write suppressed; trailing-edge fire will pick it up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return { value, setValue, throttledValue, isCooling };
};
