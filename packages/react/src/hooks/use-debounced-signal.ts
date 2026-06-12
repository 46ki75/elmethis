import { useEffect, useMemo, useRef, useState } from "react";
import { useDebounceValue } from "usehooks-ts";

/**
 * React shape returned by {@link useDebouncedSignal}.
 *
 * Qwik returns three `Signal<T>` objects (`signal`, `debouncedSignal`,
 * `isPending`). React has no signal/store split, so the equivalent is exposed
 * as a `useState`-style tuple object: `value` + `setValue` replace the
 * read/write `signal`, `debouncedValue` replaces the read-only
 * `debouncedSignal`, and `isPending` is a plain boolean.
 */
export interface UseDebouncedSignalReturn<T> {
  /** The current value. Reflects every write to `setValue` immediately. */
  value: T;
  /** Writes a new value (or applies an updater). Mirrors qwik's `signal.value =`. */
  setValue: React.Dispatch<React.SetStateAction<T>>;
  /**
   * The debounced value. Reflects `value` only after `delay` ms have elapsed
   * since the last write. Rapid successive writes reset the timer so only the
   * final value propagates.
   */
  debouncedValue: T;
  /** `true` while a debounced update is queued but has not yet committed. */
  isPending: boolean;
}

/**
 * Returns a debounced value pair where writing through `setValue` drives a
 * debounced update to `debouncedValue`.
 *
 * `value` reflects every write immediately.
 * `debouncedValue` reflects the same value only after `delay` ms have elapsed
 * since the last write. Rapid successive writes reset the timer so only the
 * final value propagates to `debouncedValue`.
 *
 * When `delay` is 0 or negative, `debouncedValue` is updated synchronously.
 *
 * @param initialValue - The initial value for both `value` and `debouncedValue`.
 * @param delay - Debounce delay in milliseconds.
 */
export const useDebouncedSignal = <T>(
  initialValue: T | (() => T),
  delay: number,
): UseDebouncedSignalReturn<T> => {
  // Resolve a lazy initializer exactly once. Passing the raw `initialValue` to
  // both state initializers would invoke the factory twice, which is
  // surprising for callers and breaks any side-effectful initializer.
  const resolved = useState(initialValue)[0];

  const [value, setValue] = useState<T>(resolved);
  const [debouncedValue, setDebouncedValue] = useDebounceValue<T>(
    resolved,
    Math.max(delay, 0),
  );

  // Mirror immediate writes into the debounced setter. With `delay <= 0` the
  // update is applied synchronously; otherwise it is queued behind the timer.
  const isFirst = useRef(true);
  useEffect(() => {
    if (isFirst.current) {
      isFirst.current = false;
      return;
    }
    if (delay <= 0) {
      setDebouncedValue(value);
      // Flush the queued update synchronously so there is no pending timer.
      setDebouncedValue.flush();
      return;
    }
    setDebouncedValue(value);
  }, [value, delay, setDebouncedValue]);

  const isPending = useMemo(
    () => !Object.is(value, debouncedValue),
    [value, debouncedValue],
  );

  return { value, setValue, debouncedValue, isPending };
};
