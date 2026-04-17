import { useCallback, useEffect, useRef, useState } from "react";

const CUSTOM_EVENT = "elm-local-storage-change";

type Setter<T> = (value: T | ((prev: T) => T)) => void;
type Remover = () => void;

export interface UseLocalStorageOptions<T> {
  serializer?: (value: T) => string;
  deserializer?: (raw: string) => T;
  broadcastChannel?: boolean;
}

export function useLocalStorage(
  key: string,
  initialValue: string,
  options: { raw: true; broadcastChannel?: boolean },
): [string, Setter<string>, Remover];
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T>,
): [T, Setter<T>, Remover];
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  options?: UseLocalStorageOptions<T> | { raw: true; broadcastChannel?: boolean },
): [T, Setter<T>, Remover] {
  const raw = !!(options && "raw" in options && options.raw);
  const useBc = options?.broadcastChannel ?? false;

  const initialValueRef = useRef(initialValue);

  // Initialized with concrete functions so refs are never null; a depless
  // useEffect keeps them current after the first render without writing during render.
  const serializerRef = useRef<(v: T) => string>(
    raw
      ? (v: T) => String(v)
      : ((!raw && options && "serializer" in options && options.serializer) ||
          ((v: T) => JSON.stringify(v))),
  );
  const deserializerRef = useRef<(s: string) => T>(
    raw
      ? (s: string) => s as unknown as T
      : ((!raw && options && "deserializer" in options && options.deserializer) ||
          ((s: string) => JSON.parse(s) as T)),
  );

  useEffect(() => {
    serializerRef.current = raw
      ? (v: T) => String(v)
      : ((!raw && options && "serializer" in options && options.serializer) ||
          ((v: T) => JSON.stringify(v)));
    deserializerRef.current = raw
      ? (s: string) => s as unknown as T
      : ((!raw && options && "deserializer" in options && options.deserializer) ||
          ((s: string) => JSON.parse(s) as T));
  });

  const bcRef = useRef<BroadcastChannel | null>(null);

  // Inline initializer avoids reading deserializerRef during render (React 19 restriction).
  const [state, setState] = useState<T>(() => {
    if (typeof localStorage === "undefined") return initialValue;
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return initialValue;
      const deserialize = raw
        ? (s: string) => s as unknown as T
        : ((!raw && options && "deserializer" in options && options.deserializer) ||
            ((s: string) => JSON.parse(s) as T));
      return deserialize(stored);
    } catch (e) {
      console.warn(`useLocalStorage: failed to read "${key}"`, e);
      return initialValue;
    }
  });

  // Reads from localStorage directly so functional updaters never see a stale
  // closure value even when set is called multiple times synchronously.
  const readFromStorage = useCallback((): T => {
    if (typeof localStorage === "undefined") return initialValueRef.current;
    try {
      const stored = localStorage.getItem(key);
      if (stored === null) return initialValueRef.current;
      return deserializerRef.current(stored);
    } catch (e) {
      console.warn(`useLocalStorage: failed to read "${key}"`, e);
      return initialValueRef.current;
    }
  }, [key]);

  const dispatchChange = useCallback(
    (newValue: T | null) => {
      if (typeof window === "undefined") return;
      window.dispatchEvent(
        new CustomEvent(CUSTOM_EVENT, { detail: { key, newValue } }),
      );
      bcRef.current?.postMessage({ newValue });
    },
    [key],
  );

  const set: Setter<T> = useCallback(
    (valueOrUpdater) => {
      const current = readFromStorage();
      const next =
        typeof valueOrUpdater === "function"
          ? (valueOrUpdater as (p: T) => T)(current)
          : valueOrUpdater;
      if (typeof localStorage !== "undefined") {
        try {
          localStorage.setItem(key, serializerRef.current(next));
        } catch (e) {
          console.warn(`useLocalStorage: failed to write "${key}"`, e);
        }
      }
      setState(next);
      dispatchChange(next);
    },
    [key, readFromStorage, dispatchChange],
  );

  const remove: Remover = useCallback(() => {
    if (typeof localStorage !== "undefined") {
      localStorage.removeItem(key);
    }
    setState(initialValueRef.current);
    dispatchChange(null);
  }, [key, dispatchChange]);

  // Cross-tab sync via the native storage event; same-tab sync via custom event.
  useEffect(() => {
    if (typeof window === "undefined") return;

    const handleStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      if (e.newValue === null) {
        setState(initialValueRef.current);
        return;
      }
      try {
        setState(deserializerRef.current(e.newValue));
      } catch (e) {
        console.warn(
          `useLocalStorage: failed to parse storage event for "${key}"`,
          e,
        );
      }
    };

    const handleCustom = (e: Event) => {
      const { key: k, newValue } = (
        e as CustomEvent<{ key: string; newValue: T | null }>
      ).detail;
      if (k !== key) return;
      setState(newValue === null ? initialValueRef.current : newValue);
    };

    window.addEventListener("storage", handleStorage);
    window.addEventListener(CUSTOM_EVENT, handleCustom);
    return () => {
      window.removeEventListener("storage", handleStorage);
      window.removeEventListener(CUSTOM_EVENT, handleCustom);
    };
  }, [key]);

  // Optional BroadcastChannel for cross-tab structured-data sync.
  // Same-tab instances are already covered by the custom event above.
  useEffect(() => {
    if (!useBc || typeof BroadcastChannel === "undefined") return;

    const channel = new BroadcastChannel(`elm-local-storage:${key}`);
    bcRef.current = channel;

    channel.onmessage = (e: MessageEvent<{ newValue: T | null }>) => {
      setState(
        e.data.newValue === null ? initialValueRef.current : e.data.newValue,
      );
    };

    return () => {
      channel.close();
      bcRef.current = null;
    };
  }, [key, useBc]);

  return [state, set, remove];
}
