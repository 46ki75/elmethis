import { useSignal, useTask$ } from "@builder.io/qwik";

/**
 * Returns a reactive signal pair where writing to `signal` drives a debounced
 * update to `debouncedSignal`.
 *
 * `signal` reflects every write immediately.
 * `debouncedSignal` reflects the same value only after `delay` ms have
 * elapsed since the last write to `signal`. Rapid successive writes reset
 * the timer so only the final value propagates to `debouncedSignal`.
 *
 * When `delay` is 0 or negative, `debouncedSignal` is updated synchronously.
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
  const isPending = useSignal(false);

  useTask$(({ track, cleanup }) => {
    const value = track(() => signal.value);

    if (delay <= 0) {
      debouncedSignal.value = value;
      isPending.value = false;
      return;
    }

    if (value === debouncedSignal.value) {
      isPending.value = false;
      return;
    }

    isPending.value = true;

    const id = setTimeout(() => {
      debouncedSignal.value = value;
      isPending.value = false;
    }, delay);

    cleanup(() => clearTimeout(id));
  });

  return { signal, debouncedSignal, isPending };
};
