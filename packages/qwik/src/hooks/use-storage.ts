import {
  $,
  noSerialize,
  type NoSerialize,
  type QRL,
  useSignal,
  useVisibleTask$,
} from "@qwik.dev/core";

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
  // One BroadcastChannel per mount, reused across every write and on remove.
  // The earlier version constructed a fresh BC per write/remove and closed
  // it immediately afterward — burning allocations for no benefit, since one
  // channel can post any number of messages.
  const bcRef = useSignal<NoSerialize<BroadcastChannel> | undefined>(undefined);

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

      window.addEventListener("storage", onStorage);

      let bc: BroadcastChannel | undefined;
      if (channel) {
        bc = new BroadcastChannel(channel);
        bcRef.value = noSerialize(bc);
        bc.onmessage = (
          event: MessageEvent<{ key: string; value: T | null }>,
        ) => {
          if (event.data.key === key) {
            state.value = event.data.value ?? initialValue;
          }
        };
      }

      cleanup(() => {
        window.removeEventListener("storage", onStorage);
        bc?.close();
        bcRef.value = undefined;
      });
    },
    { strategy: "document-ready" },
  );

  // eslint-disable-next-line qwik/no-use-visible-task
  useVisibleTask$(
    ({ track }) => {
      const newState = track(state);

      const storage = storageRef.value;
      if (!storage) return;

      try {
        storage.setItem(key, JSON.stringify(newState));
        bcRef.value?.postMessage({ key, value: newState });
      } catch (e) {
        console.warn(`useStorage: failed to write "${key}"`, e);
      }
    },
    { strategy: "document-ready" },
  );

  const remove: QRL<() => void> = $(() => {
    const storage = storageRef.value;
    if (!storage) {
      console.warn(`useStorage: storage area is not available`);
      return;
    }
    try {
      state.value = initialValue;
      storage.removeItem(key);
      bcRef.value?.postMessage({ key, value: null });
    } catch (e) {
      console.warn(`useStorage: failed to remove "${key}"`, e);
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
