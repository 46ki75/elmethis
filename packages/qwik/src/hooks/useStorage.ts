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
  /** BroadcastChannel name for cross-tab sync (required for sessionStorage) */
  channel?: string;
};

export const useStorage = <T>({
  storageArea,
  key,
  initialValue,
  channel,
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

      let bc: BroadcastChannel | undefined;
      if (channel) {
        bc = new BroadcastChannel(channel);
        bc.onmessage = (
          event: MessageEvent<{ key: string; value: T | null }>,
        ) => {
          if (event.data.key === key) {
            state.value = event.data.value ?? initialValue;
          }
        };
      }

      cleanup(() => {
        removeEventListener("storage", onStorage);
        bc?.close();
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
        if (channel) {
          const bc = new BroadcastChannel(channel);
          bc.postMessage({ key, value });
          bc.close();
        }
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
        if (channel) {
          const bc = new BroadcastChannel(channel);
          bc.postMessage({ key, value: null });
          bc.close();
        }
      } catch (e) {
        console.warn(`useStorage: failed to remove "${key}"`, e);
      }
    }
  });

  return { state, set, remove };
};

export type UseLocalStorageOptions<T> = Omit<
  UseStorageOptions<T>,
  "storageArea"
>;

export const useLocalStorage = <T>({
  key,
  initialValue,
}: UseLocalStorageOptions<T>) => {
  return useStorage<T>({
    storageArea: localStorage,
    key,
    initialValue,
  });
};

export type UseSessionStorageOptions<T> = Omit<
  UseStorageOptions<T>,
  "storageArea"
>;

export const useSessionStorage = <T>({
  key,
  initialValue,
}: UseSessionStorageOptions<T>) => {
  return useStorage<T>({
    storageArea: sessionStorage,
    key,
    initialValue,
    channel: `elmethis:sessionStorage:${key}`,
  });
};
