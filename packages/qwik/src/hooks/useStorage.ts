import {
  $,
  noSerialize,
  type QRL,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";

export type UseStorageOptions<T> = {
  storageArea: Storage;
  key: string;
  initialValue: T;
};

export const useStorage = <T>({
  storageArea,
  key,
  initialValue,
}: UseStorageOptions<T>) => {
  const state = useSignal<T>(initialValue);

  const storage = noSerialize(storageArea);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      if (storage) {
        try {
          const item = storage.getItem(key);
          if (item !== null) {
            state.value = JSON.parse(item) as T;
          }
        } catch (e) {
          console.warn(`useStorage: failed to read "${key}"`, e);
        }
      }

      const onStorage = (event: StorageEvent) => {
        if (event.storageArea === storage && event.key === key) {
          try {
            state.value = event.newValue
              ? (JSON.parse(event.newValue) as T)
              : initialValue;
          } catch (e) {
            console.warn(`useStorage: failed to parse "${key}"`, e);
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
    if (!storage) {
      console.warn(`useStorage: storage area is not available`);
    } else {
      try {
        state.value = value;
        storage.setItem(key, JSON.stringify(value));
      } catch (e) {
        console.warn(`useStorage: failed to write "${key}"`, e);
      }
    }
  });

  const remove: QRL<() => void> = $(() => {
    if (!storage) {
      console.warn(`useStorage: storage area is not available`);
    } else {
      try {
        state.value = initialValue;
        storage.removeItem(key);
      } catch (e) {
        console.warn(`useStorage: failed to remove "${key}"`, e);
      }
    }
  });

  return { state, set, remove };
};
