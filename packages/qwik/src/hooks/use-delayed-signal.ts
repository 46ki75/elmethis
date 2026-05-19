import {
  $,
  noSerialize,
  useSignal,
  useTask$,
  type NoSerialize,
} from "@qwik.dev/core";

/**
 * Imperative companion to `useDebouncedSignal`: the consumer chooses *when*
 * and *with what delay* a write should propagate from `signal` (eager) to
 * `delayedSignal` (lagging).
 *
 * `signal` reflects the dispatched value immediately.
 * `delayedSignal` receives the same value after `delay` ms, or synchronously
 * when `delay` is omitted / `<= 0`.
 *
 * Calling `dispatch` again before the previous timer fires **cancels** the
 * earlier pending update. Without that cancellation, two overlapping
 * dispatches would race and the older value could clobber the newer one
 * after both timers fire.
 *
 * `isSignalChanging` is `true` while a timer is pending.
 *
 * @param initialValue - Seed value for both signals.
 */
export const useDelayedSignal = <T>(
  initialValue: Parameters<typeof useSignal<T>>[0],
) => {
  const signal = useSignal<T>(initialValue);
  const delayedSignal = useSignal<T>(initialValue);
  const timerId = useSignal<
    NoSerialize<ReturnType<typeof setTimeout>> | undefined
  >(undefined);

  // Unmount-only cleanup: clears any pending timer so it can't fire on a
  // disposed component. Kept in its own task so the cleanup does not run on
  // every dispatch (which would defeat the purpose of the cancellation logic
  // in `dispatch`).
  useTask$(({ cleanup }) => {
    cleanup(() => {
      if (timerId.value !== undefined) clearTimeout(timerId.value);
    });
  });

  const dispatch = $((value: T, delay?: number) => {
    // Cancel any pending dispatch — the newest call wins.
    if (timerId.value !== undefined) {
      clearTimeout(timerId.value);
      timerId.value = undefined;
    }

    signal.value = value;

    if (delay === undefined || delay <= 0) {
      delayedSignal.value = value;
      return;
    }

    timerId.value = noSerialize(
      setTimeout(() => {
        delayedSignal.value = value;
        timerId.value = undefined;
      }, delay),
    );
  });

  return { signal, delayedSignal, dispatch };
};
