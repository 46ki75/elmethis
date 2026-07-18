import {
  createSignal,
  onCleanup,
  onMount,
  type Accessor,
  type Setter,
} from "solid-js";

type StorageArea = "local" | "session";
type StorageOperation = { type: "set"; value: string } | { type: "remove" };

type StorageSyncMessage = StorageOperation & {
  protocol: "elmethis-storage-v1";
  key: string;
};

type LocalStorageSyncMessage = StorageSyncMessage & { source: object };

const LOCAL_STORAGE_SYNC_EVENT = "elmethis-local-storage-change";
const SESSION_CHANNEL_PREFIX = "elmethis:sessionStorage:";

export interface CreateStorageOptions<T> {
  key: string;
  initialValue: T;
}

export type CreateLocalStorageOptions<T> = CreateStorageOptions<T>;
export type CreateSessionStorageOptions<T> = CreateStorageOptions<T>;

export interface StorageController<T> {
  /** Starts at initialValue during SSR, then hydrates from storage on mount. */
  state: Accessor<T>;
  /** Updates the signal and persists the resolved Solid setter value. */
  setState: Setter<T>;
  /** Restores initialValue and removes the persisted key. */
  remove: () => void;
}

const parse = <T>(serialized: string): T => JSON.parse(serialized) as T;

const serialize = <T>(value: T): string => {
  const serialized = JSON.stringify(value);
  if (serialized === undefined) {
    throw new TypeError("The storage value is not JSON-serializable");
  }
  return serialized;
};

const isStorageSyncMessage = (value: unknown): value is StorageSyncMessage => {
  if (typeof value !== "object" || value === null) return false;
  const message = value as Record<string, unknown>;
  return (
    message.protocol === "elmethis-storage-v1" &&
    typeof message.key === "string" &&
    (message.type === "remove" ||
      (message.type === "set" && typeof message.value === "string"))
  );
};

const warn = (operation: string, key: string, error: unknown): void => {
  console.warn(`createStorage: failed to ${operation} "${key}"`, error);
};

function createStorage<T>(
  area: StorageArea,
  options: CreateStorageOptions<T>,
): StorageController<T> {
  const [state, setStateRaw] = createSignal<T>(options.initialValue);
  const source = {};
  let storage: Storage | undefined;
  let channel: BroadcastChannel | undefined;
  let mounted = false;

  const setRawValue = (value: T): T =>
    setStateRaw((() => value) as (previous: T) => T);

  const applyIncoming = (operation: StorageOperation): void => {
    if (operation.type === "remove") {
      setRawValue(options.initialValue);
      return;
    }

    try {
      setRawValue(parse<T>(operation.value));
    } catch (error) {
      warn("parse", options.key, error);
    }
  };

  const persist = (operation: StorageOperation): void => {
    if (!mounted) return;

    if (storage) {
      try {
        if (operation.type === "remove") storage.removeItem(options.key);
        else storage.setItem(options.key, operation.value);
      } catch (error) {
        warn(
          operation.type === "remove" ? "remove" : "write",
          options.key,
          error,
        );
      }
    }

    const message: StorageSyncMessage = {
      protocol: "elmethis-storage-v1",
      key: options.key,
      ...operation,
    };

    if (area === "local") {
      window.dispatchEvent(
        new CustomEvent<LocalStorageSyncMessage>(LOCAL_STORAGE_SYNC_EVENT, {
          detail: { ...message, source },
        }),
      );
    } else if (channel) {
      try {
        channel.postMessage(message);
      } catch (error) {
        warn("broadcast", options.key, error);
      }
    }
  };

  const setState = ((value: Parameters<Setter<T>>[0]): T => {
    const nextValue = setStateRaw(value);
    try {
      persist({ type: "set", value: serialize(nextValue) });
    } catch (error) {
      warn("serialize", options.key, error);
    }
    return nextValue;
  }) as Setter<T>;

  const remove = (): void => {
    setRawValue(options.initialValue);
    persist({ type: "remove" });
  };

  onMount(() => {
    mounted = true;

    try {
      storage = area === "local" ? window.localStorage : window.sessionStorage;
      const storedValue = storage.getItem(options.key);
      if (storedValue === null) {
        try {
          storage.setItem(options.key, serialize(options.initialValue));
        } catch (error) {
          warn("write", options.key, error);
        }
      } else {
        applyIncoming({ type: "set", value: storedValue });
      }
    } catch (error) {
      storage = undefined;
      warn("read", options.key, error);
    }

    const onStorage = (event: StorageEvent): void => {
      if (
        event.key !== options.key ||
        (event.storageArea !== null && event.storageArea !== storage)
      ) {
        return;
      }
      applyIncoming(
        event.newValue === null
          ? { type: "remove" }
          : { type: "set", value: event.newValue },
      );
    };
    const onLocalSync = (event: Event): void => {
      const message = (event as CustomEvent<LocalStorageSyncMessage>).detail;
      if (
        message?.source === source ||
        !isStorageSyncMessage(message) ||
        message.key !== options.key
      ) {
        return;
      }
      applyIncoming(message);
    };

    window.addEventListener("storage", onStorage);
    if (area === "local") {
      window.addEventListener(LOCAL_STORAGE_SYNC_EVENT, onLocalSync);
    } else if (typeof BroadcastChannel !== "undefined") {
      try {
        channel = new BroadcastChannel(
          `${SESSION_CHANNEL_PREFIX}${options.key}`,
        );
        channel.addEventListener("message", (event: MessageEvent<unknown>) => {
          if (
            !isStorageSyncMessage(event.data) ||
            event.data.key !== options.key
          ) {
            return;
          }

          applyIncoming(event.data);
          if (storage) {
            try {
              if (event.data.type === "remove") storage.removeItem(options.key);
              else storage.setItem(options.key, event.data.value);
            } catch (error) {
              warn("mirror", options.key, error);
            }
          }
        });
      } catch (error) {
        channel = undefined;
        warn("open broadcast channel for", options.key, error);
      }
    }

    onCleanup(() => {
      mounted = false;
      storage = undefined;
      window.removeEventListener("storage", onStorage);
      window.removeEventListener(LOCAL_STORAGE_SYNC_EVENT, onLocalSync);
      channel?.close();
      channel = undefined;
    });
  });

  return { state, setState, remove };
}

export const createLocalStorage = <T>(
  options: CreateLocalStorageOptions<T>,
): StorageController<T> => createStorage("local", options);

export const createSessionStorage = <T>(
  options: CreateSessionStorageOptions<T>,
): StorageController<T> => createStorage("session", options);
