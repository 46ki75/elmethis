import { useCallback, useEffect, useRef, useState } from "react";

export interface UseDelayedSignalReturn<T> {
  /** Reflects the dispatched value immediately. */
  value: T;
  /** Receives the dispatched value after `delay` ms (or synchronously). */
  delayedValue: T;
  /** `true` while a timer is pending. */
  isValueChanging: boolean;
  /**
   * Propagate `value` to `value` immediately and to `delayedValue` after
   * `delay` ms, or synchronously when `delay` is omitted / `<= 0`.
   */
  dispatch: (value: T, delay?: number) => void;
}

/**
 * Imperative companion to a debounced value: the consumer chooses *when*
 * and *with what delay* a write should propagate from `value` (eager) to
 * `delayedValue` (lagging).
 *
 * `value` reflects the dispatched value immediately.
 * `delayedValue` receives the same value after `delay` ms, or synchronously
 * when `delay` is omitted / `<= 0`.
 *
 * Calling `dispatch` again before the previous timer fires **cancels** the
 * earlier pending update. Without that cancellation, two overlapping
 * dispatches would race and the older value could clobber the newer one
 * after both timers fire.
 *
 * `isValueChanging` is `true` while a timer is pending.
 *
 * Unlike the qwik twin (which returns a `{ signal, delayedSignal, dispatch }`
 * trio of signals), this React port returns plain reactive values via
 * `{ value, delayedValue, isValueChanging, dispatch }`.
 *
 * @param initialValue - Seed value for both `value` and `delayedValue`.
 */
export const useDelayedSignal = <T>(
  initialValue: T,
): UseDelayedSignalReturn<T> => {
  const [value, setValue] = useState<T>(initialValue);
  const [delayedValue, setDelayedValue] = useState<T>(initialValue);
  const [isValueChanging, setIsValueChanging] = useState(false);
  const timerId = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  // Unmount-only cleanup: clears any pending timer so it can't fire on a
  // disposed component. The empty dependency array keeps the cleanup from
  // running on every dispatch (which would defeat the purpose of the
  // cancellation logic in `dispatch`).
  useEffect(() => {
    return () => {
      if (timerId.current !== undefined) clearTimeout(timerId.current);
    };
  }, []);

  const dispatch = useCallback((value: T, delay?: number) => {
    // Cancel any pending dispatch — the newest call wins.
    if (timerId.current !== undefined) {
      clearTimeout(timerId.current);
      timerId.current = undefined;
    }

    setValue(value);

    if (delay === undefined || delay <= 0) {
      setDelayedValue(value);
      setIsValueChanging(false);
      return;
    }

    setIsValueChanging(true);
    timerId.current = setTimeout(() => {
      setDelayedValue(value);
      setIsValueChanging(false);
      timerId.current = undefined;
    }, delay);
  }, []);

  return { value, delayedValue, isValueChanging, dispatch };
};
