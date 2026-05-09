import { $, type NoSerialize, noSerialize, type QRL, useSignal } from "@builder.io/qwik";

/**
 * Returns a signal pair and a debounced setter.
 *
 * `signal` reflects the most recently written value immediately.
 * `debouncedSignal` reflects the same value only after `delay` ms have
 * elapsed since the last call to `set`. Rapid successive calls reset
 * the timer so only the final value propagates to `debouncedSignal`.
 *
 * When `delay` is 0 or negative, `debouncedSignal` is updated
 * synchronously (no timer).
 *
 * @param initialValue - The initial value for both signals.
 * @param delay - Debounce delay in milliseconds.
 */
export const useDebouncedSignal = <T>(
  initialValue: Parameters<typeof useSignal<T>>[0],
  delay: number,
) => {
  const signal = useSignal<T>(initialValue);
  const debouncedSignal = useSignal<T>(initialValue);
  const timeoutId = useSignal<
    NoSerialize<ReturnType<typeof setTimeout>> | undefined
  >(undefined);

  const set: QRL<(value: T) => void> = $((value: T) => {
    signal.value = value;

    if (timeoutId.value !== undefined) {
      clearTimeout(timeoutId.value);
    }

    if (delay <= 0) {
      debouncedSignal.value = value;
      timeoutId.value = undefined;
    } else {
      timeoutId.value = noSerialize(
        setTimeout(() => {
          debouncedSignal.value = value;
          timeoutId.value = undefined;
        }, delay),
      );
    }
  });

  return { signal, debouncedSignal, set };
};
