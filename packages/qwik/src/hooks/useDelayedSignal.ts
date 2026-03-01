import { $, useSignal } from "@builder.io/qwik";

export const useDelayedSignal = <T>(
  initialValue: Parameters<typeof useSignal<T>>[0],
) => {
  const signal = useSignal<T>(initialValue);
  const delayedSignal = useSignal<T>(initialValue);
  const isSignalChanging = useSignal(false);

  const dispatch = $((value: T, delay?: number) => {
    isSignalChanging.value = true;
    signal.value = value;

    if (delay === undefined || delay <= 0) {
      delayedSignal.value = value;
      isSignalChanging.value = false;
    } else {
      const timerId = setTimeout(() => {
        delayedSignal.value = value;
        isSignalChanging.value = false;
        clearTimeout(timerId);
      }, delay);
    }
  });

  return { signal, delayedSignal, dispatch };
};
