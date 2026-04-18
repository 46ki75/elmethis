import { $, type QRL, useSignal, useVisibleTask$ } from "@builder.io/qwik";

export type UseLocalStorageOptions<T> = {
  key: string;
  initialValue: T;
};

export const useLocalStorage = <T>({
  key,
  initialValue,
}: UseLocalStorageOptions<T>) => {
  const state = useSignal<T>(initialValue);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      try {
        const item = localStorage.getItem(key);
        if (item !== null) {
          state.value = JSON.parse(item) as T;
        }
      } catch (e) {
        console.warn(`useLocalStorage: failed to read "${key}"`, e);
      }

      const onStorage = (event: StorageEvent) => {
        if (event.storageArea === localStorage && event.key === key) {
          try {
            state.value = event.newValue
              ? (JSON.parse(event.newValue) as T)
              : initialValue;
          } catch (e) {
            console.warn(`useLocalStorage: failed to parse "${key}"`, e);
          }
        }
      };

      addEventListener("storage", onStorage);
      cleanup(() => {
        removeEventListener("storage", onStorage);
      });
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
