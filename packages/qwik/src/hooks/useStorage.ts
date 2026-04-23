import {
  $,
  noSerialize,
  type NoSerialize,
  type QRL,
  useSignal,
  useVisibleTask$,
} from "@builder.io/qwik";

export type UseStorageOptions<T> = {
  storageArea: "local" | "session";
  key: string;
  initialValue: T;
  /** BroadcastChannel name for cross-tab sync (required for sessionStorage) */
  channel?: string;
};

const resolveStorage = (area: "local" | "session"): Storage =>
  area === "local" ? localStorage : sessionStorage;

export const useStorage = <T>({
  storageArea,
  key,
  initialValue,
  channel,
}: UseStorageOptions<T>) => {
  const state = useSignal<T>(initialValue);
  const storageRef = useSignal<NoSerialize<Storage> | undefined>(undefined);

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ cleanup }) => {
      const resolved = resolveStorage(storageArea);
      storageRef.value = noSerialize(resolved);

      try {
        const item = resolved.getItem(key);
        if (item !== null) {
          state.value = JSON.parse(item) as T;
        }
      } catch (e) {
        console.warn(`useStorage: failed to read "${key}"`, e);
      }

      const onStorage = (event: StorageEvent) => {
        if (event.storageArea === resolved && event.key === key) {
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

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(({ track }) => {
    const newState = track(state);

    const storage = storageRef.value;
    if (!storage) {
      console.warn(`useStorage: storage area is not available`);
    } else {
      try {
        state.value = newState;
        storage.setItem(key, JSON.stringify(newState));
        if (channel) {
          const bc = new BroadcastChannel(channel);
          bc.postMessage({ key, value: newState });
          bc.close();
        }
      } catch (e) {
        console.warn(`useStorage: failed to write "${key}"`, e);
      }
    }
  });

  const remove: QRL<() => void> = $(() => {
    const storage = storageRef.value;
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

  return { state, remove };
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
    storageArea: "local",
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
    storageArea: "session",
    key,
    initialValue,
    channel: `elmethis:sessionStorage:${key}`,
  });
};
