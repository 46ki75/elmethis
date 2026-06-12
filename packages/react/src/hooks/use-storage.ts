import { useCallback, useEffect, useRef, useState } from "react";

export type UseStorageOptions<T> = {
  storageArea: "local" | "session";
  key: string;
  initialValue: T;
  /** BroadcastChannel name for cross-tab sync (required for sessionStorage) */
  channel?: string;
};

export type UseStorageReturn<T> = {
  /** The current value. Initialized with `initialValue` until the client reads storage. */
  state: T;
  /** Update the value (and persist it to the storage area). */
  setState: (value: T) => void;
  /** Reset to `initialValue` and remove the key from the storage area. */
  remove: () => void;
};

const resolveStorage = (area: "local" | "session"): Storage =>
  area === "local" ? localStorage : sessionStorage;

/**
 * Persisted, cross-tab-synced state backed by `localStorage` / `sessionStorage`.
 *
 * React port of qwik's `useStorage`. Qwik's signal model does not exist in
 * React, so where qwik returned `{ state, remove }` with `state` as a
 * read/write `Signal<T>`, this returns `{ state, setState, remove }` — read
 * `state`, write with `setState(next)`, clear with `remove()`.
 *
 * Reads happen only on the client (after mount), matching qwik's
 * `useVisibleTask$({ strategy: "document-ready" })`. Cross-tab sync uses the
 * native `storage` event for `localStorage`; `sessionStorage` (which does not
 * emit `storage` across tabs) syncs via a `BroadcastChannel`. The channel is
 * allocated once per mount and reused for every write/remove.
 */
export const useStorage = <T>({
  storageArea,
  key,
  initialValue,
  channel,
}: UseStorageOptions<T>): UseStorageReturn<T> => {
  const [state, setStateRaw] = useState<T>(initialValue);
  const storageRef = useRef<Storage | undefined>(undefined);
  // One BroadcastChannel per mount, reused across every write and on remove.
  // The earlier version constructed a fresh BC per write/remove and closed it
  // immediately afterward — burning allocations for no benefit, since one
  // channel can post any number of messages.
  const bcRef = useRef<BroadcastChannel | undefined>(undefined);

  // Keep the latest `key` / `initialValue` available to the stable callbacks
  // without re-creating them on every render.
  const keyRef = useRef(key);
  const initialValueRef = useRef(initialValue);

  // Sync after each commit (the rule forbids writing refs during render).
  useEffect(() => {
    keyRef.current = key;
    initialValueRef.current = initialValue;
  });

  // Mount: resolve the storage area, hydrate from it, and subscribe to
  // cross-tab updates (storage event + optional BroadcastChannel).
  useEffect(() => {
    const resolved = resolveStorage(storageArea);
    storageRef.current = resolved;

    try {
      const item = resolved.getItem(key);
      if (item !== null) {
        // Mount-time hydration from the storage area into React state —
        // the canonical "subscribe to an external store" effect.
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setStateRaw(JSON.parse(item) as T);
      }
    } catch (e) {
      console.warn(`useStorage: failed to read "${key}"`, e);
    }

    const onStorage = (event: StorageEvent) => {
      if (event.storageArea === resolved && event.key === key) {
        try {
          setStateRaw(
            event.newValue ? (JSON.parse(event.newValue) as T) : initialValue,
          );
        } catch (e) {
          console.warn(`useStorage: failed to parse "${key}"`, e);
        }
      }
    };

    window.addEventListener("storage", onStorage);

    let bc: BroadcastChannel | undefined;
    if (channel) {
      bc = new BroadcastChannel(channel);
      bcRef.current = bc;
      bc.onmessage = (
        event: MessageEvent<{ key: string; value: T | null }>,
      ) => {
        if (event.data.key === key) {
          setStateRaw(event.data.value ?? initialValue);
        }
      };
    }

    return () => {
      window.removeEventListener("storage", onStorage);
      bc?.close();
      bcRef.current = undefined;
    };
    // Re-subscribe only when the storage identity changes. `initialValue` is
    // read through a ref above so it does not need to be a dependency.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageArea, key, channel]);

  // Persist whenever `state` changes. Runs after mount (once the storage ref
  // is set), mirroring qwik's writer visible-task — including the initial run
  // that persists `initialValue` when storage was empty at mount.
  useEffect(() => {
    const storage = storageRef.current;
    if (!storage) return;

    try {
      storage.setItem(key, JSON.stringify(state));
      bcRef.current?.postMessage({ key, value: state });
    } catch (e) {
      console.warn(`useStorage: failed to write "${key}"`, e);
    }
  }, [key, state]);

  const setState = useCallback((value: T) => {
    setStateRaw(value);
  }, []);

  const remove = useCallback(() => {
    const storage = storageRef.current;
    if (!storage) {
      console.warn(`useStorage: storage area is not available`);
      return;
    }
    try {
      setStateRaw(initialValueRef.current);
      storage.removeItem(keyRef.current);
      bcRef.current?.postMessage({ key: keyRef.current, value: null });
    } catch (e) {
      console.warn(`useStorage: failed to remove "${keyRef.current}"`, e);
    }
  }, []);

  return { state, setState, remove };
};

export type UseLocalStorageOptions<T> = Omit<
  UseStorageOptions<T>,
  "storageArea"
>;

export const useLocalStorage = <T>({
  key,
  initialValue,
}: UseLocalStorageOptions<T>): UseStorageReturn<T> => {
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
}: UseSessionStorageOptions<T>): UseStorageReturn<T> => {
  return useStorage<T>({
    storageArea: "session",
    key,
    initialValue,
    channel: `elmethis:sessionStorage:${key}`,
  });
};
