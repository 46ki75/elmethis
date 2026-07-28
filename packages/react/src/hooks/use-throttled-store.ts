import {
  useEffect,
  useRef,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";
import { isEqual } from "es-toolkit";

export interface UseThrottledStoreReturn<T extends object> {
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
 * Returns reactive struct state where writing to `value` drives a leading +
 * trailing edge throttled update to `throttledValue`.
 *
 * The React API returns `{ value, setValue, throttledValue, isCooling }`:
 * `value`/`setValue` is the usual `useState` pair, `throttledValue` and
 * `isCooling` are read-only. To update a field, set a fresh object:
 * `setValue((prev) => ({ ...prev, name: "Alice" }))`.
 *
 * Because React state is immutable, callers hand the hook fresh objects.
 * Equality between the two
 * stores is compared **structurally** (`es-toolkit` `isEqual`), so setting a
 * fresh object that is deeply equal to the current `throttledValue` does not
 * arm a throttle window.
 *
 * `value` reflects every write immediately.
 * `throttledValue` updates on the *leading edge* of each throttle window: the
 * first write within any `interval` ms window propagates at once. Further writes
 * within the same window are suppressed, but the most recent suppressed value is
 * delivered on the *trailing edge* when the window expires, and a fresh window
 * starts.
 *
 * `isCooling` is `true` while the throttle cooldown window is active.
 *
 * When `interval` is 0 or negative, `throttledValue` is updated synchronously
 * alongside `value` (no throttling).
 *
 * Aliasing footgun: passing a module-scope object as `initialValue` will share
 * its nested references across every component instance. Pass a fresh object
 * literal at the call site so updates do not leak between instances.
 *
 * @param initialValue - The initial value for both `value` and `throttledValue`.
 * @param interval - Throttle interval in milliseconds.
 *
 * @example
 * ```tsx
 * const { value, setValue, throttledValue, isCooling } =
 *   useThrottledStore({ x: 0, y: 0 }, 100);
 *
 * // value updates on every mousemove
 * // throttledValue updates at most once every 100 ms
 * <div onMouseMove={(e) => setValue({ x: e.clientX, y: e.clientY })} />
 * ```
 */
export const useThrottledStore = <T extends object>(
  initialValue: T | (() => T),
  interval: number,
): UseThrottledStoreReturn<T> => {
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
      // hook's unthrottled `interval <= 0` branch.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setThrottledValue(value);
      return;
    }

    const arm = () => {
      setIsCooling(true);
      cooldownId.current = setTimeout(() => {
        cooldownId.current = undefined;
        setIsCooling(false);
        if (!isEqual(valueRef.current, throttledRef.current)) {
          throttledRef.current = valueRef.current;
          setThrottledValue(valueRef.current);
          arm();
        }
      }, interval);
    };

    if (cooldownId.current === undefined) {
      if (isEqual(value, throttledRef.current)) return;
      throttledRef.current = value;
      setThrottledValue(value);
      arm();
    }
    // else: write suppressed; trailing-edge fire will pick it up.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return { value, setValue, throttledValue, isCooling };
};
