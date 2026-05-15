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
 * SSR caveat: this hook arms a `setTimeout` inside a `useTask$`. On the
 * server the timer never fires before HTML serialization, so any write to
 * `signal` that happens *during* SSR (e.g. via a sibling `useTask$`) ships a
 * stuck `isPending: true` and a stale `debouncedSignal` to the client. Seed
 * the signal from `useSignal(initial)` / a `routeLoader$` value at
 * construction instead of writing it from a server task.
 *
 * @param initialValue - The initial value for both signals.
 * @param delay - Debounce delay in milliseconds.
 */
export const useDebouncedSignal = <T>(
  initialValue: Parameters<typeof useSignal<T>>[0],
  delay: number,
) => {
  // Resolve a lazy initializer once. Passing the raw `initialValue` to both
  // `useSignal` calls would invoke the factory twice (once per call), which
  // is surprising for callers and breaks any side-effectful initializer.
  const resolved = (
    typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue
  ) as T;
  const signal = useSignal<T>(resolved);
  const debouncedSignal = useSignal<T>(resolved);
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
