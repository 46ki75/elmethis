import { $, type QRL, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export const useLocalStorage = <T>(key: string, initialValue: T) => {
  const state = useSignal<T>(initialValue);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    () => {
      try {
        const item = localStorage.getItem(key);
        if (item !== null) {
          state.value = JSON.parse(item) as T;
        }
      } catch (e) {
        console.warn(`useLocalStorage: failed to read "${key}"`, e);
      }
    },
    { strategy: "document-ready" },
  );

  const set: QRL<(value: T) => void> = $((value: T) => {
    try {
      state.value = value;
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.warn(`useLocalStorage: failed to write "${key}"`, e);
    }
  });

  const remove: QRL<() => void> = $(() => {
    try {
      state.value = initialValue;
      localStorage.removeItem(key);
    } catch (e) {
      console.warn(`useLocalStorage: failed to remove "${key}"`, e);
    }
  });

  return { state, set, remove };
};
